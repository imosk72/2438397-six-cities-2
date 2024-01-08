import chalk from 'chalk';
import pkg from '../../../package.json';

import { ICliCommand } from '../CLI-command-interface.js';

export class HelpCommand implements ICliCommand {
  public readonly name = '--help';

  public async printHelp(): Promise<void> {
    await this.execute();
  }

  public async execute(): Promise<void> {
    console.log(`NAME:\n    ${pkg.name} - ${pkg.description}\n`);
    console.log(`USAGE:\n    ${chalk.bold('cli.js')} command ${chalk.blue('[arguments...]')}\n`);
    console.log(`VERSION:\n    ${pkg.version}\n`);
    console.log('COMMANDS:');
    console.log(`    ${chalk.bold('--help')} - Shows a list of commands`);
    console.log(`    ${chalk.bold('--version')} - Shows a version`);
    console.log(`    ${chalk.bold('--import')} - Imports data from TSV-file`);
    console.log(`    ${chalk.bold('--generate')} - Generates TSV-files with offers`);
    console.log('\nFor detailed info about command use');
    console.log(`    ${chalk.bold(`cli.js ${chalk.blue('<command>')} --help`)}`);
  }
}
