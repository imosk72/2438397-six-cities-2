import chalk from 'chalk';
import { ICliCommand } from '../ICliCommand.js';
import { FileWriter } from '../../services/fileService.js';
import { OfferService } from '../../services/offerService.js';
import { HttpService } from '../../services/httpService.js';

export class GenerateCommand implements ICliCommand {
  public readonly name = '--generate';

  public async printHelp() : Promise<void> {
    console.log('NAME:\n    "generate" - Generates test offer data and writes it to file\n');
    console.log(`USAGE:\n    ${chalk.bold('cli.js')} generate ${chalk.blue('<count> <path> <url>')}\n`);
    console.log('ARGUMENTS:');
    console.log(`    ${chalk.bold('<count>')} - How many offers should be generated`);
    console.log(`    ${chalk.bold('<path>')} - Path to file to write offers data`);
    console.log(`    ${chalk.bold('<url>')} - Url with test data`);
  }

  public async execute(count: string, path: string, url: string) : Promise<void> {
    const offerCount = Number.parseInt(count, 10);
    const httpService = new HttpService();

    const initialData = await httpService.getMockData(url);

    const fileWriter = new FileWriter(path);
    const offerService = new OfferService();

    for (let _ = 0; _ < offerCount; _++) {
      await fileWriter.writeLine(
        offerService.offerToTsvString(offerService.generateOffer(initialData))
      );
    }

    console.log('Succeeded');
  }
}
