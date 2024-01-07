import pkg from '../../../package.json';

import { ICliCommand } from '../ICliCommand.js';

export class VersionCommand implements ICliCommand {
  public readonly name = '--version';

  public async printHelp(): Promise<void> {
    console.log('Prints version of executable program');
  }

  public async execute() : Promise<void> {
    console.log(pkg.version);
  }
}
