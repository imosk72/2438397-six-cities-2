import chalk from 'chalk';
import {ICliCommand} from '../ICliCommand.js';
import {FileReader} from '../../services/fileService.js';
import {OfferService} from '../../services/offerService.js';

export class ImportCommand implements ICliCommand {
  public readonly name = 'import';

  public async printHelp() : Promise<void> {
    console.log('NAME:\n    "import" - Imports data from TSV-file\n');
    console.log(`USAGE:\n    ${chalk.bold('cli.js')} import ${chalk.blue('<path>')}\n`);
    console.log('ARGUMENTS:');
    console.log(`    ${chalk.bold('<path>')} - The path to the file from which you want to import data in tsv format`);
  }

  public async execute(path: string) : Promise<void> {
    const reader = new FileReader(path);
    const offerService = new OfferService();

    for await (const line of reader.readStrings()) {
      const offer = offerService.parseOffer(line);
      console.log(JSON.stringify(offer));
    }
  }
}
