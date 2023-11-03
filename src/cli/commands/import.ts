import chalk from 'chalk';
import {ICliCommand} from '../ICliCommand.js';
import {FileReader} from '../../services/fileService.js';
import {OfferService} from '../../services/offerService.js';
import {PinoLogger} from "../../common/logging/pinoLogger";
import {ConfigRegistry} from "../../common/config/configRegistry";
import {MongoClient} from "../../common/db/mongoClient";
import {UserRepository} from "../../repositories/userRepository/UserRepository";
import {OfferRepository} from "../../repositories/offerRepository/OfferRepository";
import {OfferModelSchema} from "../../models/offer/offerModelSchema";
import {UserModelSchema} from "../../models/user/userModelSchema";
import {applicationConfigSchema} from "../../application/appConfigSchema";

export class ImportCommand implements ICliCommand {
  public readonly name = 'import';

  public async printHelp() : Promise<void> {
    console.log('NAME:\n    "import" - Imports data from TSV-file and save into db.\n');
    console.log(`USAGE:\n    ${chalk.bold('cli.js')} import ${chalk.blue('<path>')} ${chalk.blue('<uri>')}\n`);
    console.log('ARGUMENTS:');
    console.log(`    ${chalk.bold('<path>')} - The path to the file from which you want to import data in tsv format`);
    console.log(`    ${chalk.bold('<uri>')} - Database URI to connect`);
  }

  public async execute(path: string, uri: string) : Promise<void> {
    // init all required entities
    const reader = new FileReader(path);
    const offerService = new OfferService();
    const logger = new PinoLogger();
    const configRegistry = new ConfigRegistry(logger, applicationConfigSchema);
    const dbClient = new MongoClient(logger);
    await dbClient.connect(uri);
    const userRepository = new UserRepository(logger, configRegistry, dbClient, UserModelSchema);
    const offerRepository = new OfferRepository(logger, dbClient, OfferModelSchema);

    //read file and save models into db
    for await (const line of reader.readStrings()) {
      const offer = offerService.parseOffer(line);
      let user = await userRepository.findByEmail(offer.author.email);
      if (user === null) {
        user = await userRepository.save(
          {name: offer.author.name, email: offer.author.email, password: configRegistry.get('DEFAULT_PASSWORD')}
        );
      }
      await offerRepository.save(
        {
          ...offer,
          authorId: user.id!,
        }
      )
    }

    //close db session
    await dbClient.disconnect();
  }
}
