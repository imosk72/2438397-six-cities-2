import chalk from 'chalk';
import { ICliCommand } from '../CLI-command-interface';
import { FileReader } from '../../services/file-service';
import { OfferService } from '../../services/offer-service';
import { PinoLogger } from '../../common/logging/pino-logger';
import { ConfigRegistry } from '../../common/config/config-registry';
import { MongoClient } from '../../common/db/mongo-client';
import { UserRepository } from '../../repositories/user-repository/user-repository';
import { OfferRepository } from '../../repositories/offer-repository/offer-repository';
import { OfferModelSchema } from '../../models/offer/offer-model-schema';
import { UserModelSchema } from '../../models/user/user-model-schema';
import { applicationConfigSchema } from '../../application/app-config-schema';
import { getMongoConnectionUri } from '../../utils/db.js';
import { UserLevel } from '../../models/enums.js';

export class ImportCommand implements ICliCommand {
  public readonly name = '--import';

  public async printHelp() : Promise<void> {
    console.log('NAME:\n    "import" - Imports data from TSV-file and save into db.');
    console.log(`    ${chalk.bold('NOTE!')} Correct mongo db properties should be provided in .env file\n`);
    console.log(`USAGE:\n    ${chalk.bold('cli.js')} import ${chalk.blue('<path>')}\n`);
    console.log('ARGUMENTS:');
    console.log(`    ${chalk.bold('<path>')} - The path to the file from which you want to import data in tsv format`);
  }

  public async execute(path: string) : Promise<void> {
    // init all required entities
    const reader = new FileReader(path);
    const offerService = new OfferService();
    const logger = new PinoLogger();
    const configRegistry = new ConfigRegistry(logger, applicationConfigSchema);

    const dbHost = configRegistry.get('DB_HOST');
    const dbPort = configRegistry.get('DB_PORT');
    const dbName = configRegistry.get('DB_NAME');
    const dbUser = configRegistry.get('DB_USER');
    const dbPassword = configRegistry.get('DB_PASSWORD');
    const dbUri = getMongoConnectionUri(dbHost, dbPort, dbName, dbUser, dbPassword);

    const dbClient = new MongoClient(logger);
    await dbClient.connect(dbUri);
    const userRepository = new UserRepository(logger, configRegistry, dbClient, UserModelSchema);
    const offerRepository = new OfferRepository(logger, dbClient, OfferModelSchema);

    //read file and save models into db
    for await (const line of reader.readStrings()) {
      const offer = offerService.parseOffer(line);
      let user = await userRepository.findByEmail(offer.author.email);
      if (user === null) {
        user = await userRepository.save(
          {
            username: offer.author.name,
            email: offer.author.email,
            password: configRegistry.get('DEFAULT_PASSWORD'),
            type: UserLevel.STANDART,
            avatar: offer.author.avatar,
          }
        );
      }
      await offerRepository.save(
        {
          ...offer,
          authorId: `${user?.id}`,
          commentsCount: 0,
          commentsTotalRating: 0,
        }
      );
    }

    //close db session
    await dbClient.disconnect();
  }
}
