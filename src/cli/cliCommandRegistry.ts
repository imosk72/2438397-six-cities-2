import {ICliCommand} from './ICliCommand.js';

export class CliCommandRegistry {
  private commands: { [propertyName: string]: ICliCommand } = {};
  private defaultCommandName = '--help';

  public async processCommand(argv: string[]): Promise<void> {
    const executableCommand = this.getCommand(this.getCommandName(argv));
    const commandArguments = this.getCommandArguments(argv);

    if (commandArguments.length > 0 && commandArguments[0] === '--help') {
      await executableCommand.printHelp();
    } else {
      await executableCommand.execute(...commandArguments);
    }
  }

  public registerCommand(command: ICliCommand): void {
    this.commands[command.name] = command;
  }

  private getCommand(commandName: string): ICliCommand {
    return this.commands[commandName] ?? this.commands[this.defaultCommandName];
  }

  private getCommandName(argv: string[]): string {
    if (argv.length < 3) {
      return this.defaultCommandName;
    }
    return argv[2];
  }

  private getCommandArguments(argv: string[]) : string[] {
    if (argv.length < 4) {
      return [];
    }
    return argv.slice(3);
  }
}
