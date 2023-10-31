import {VersionCommand} from './commands/version.js';
import {HelpCommand} from './commands/help.js';
import {CliCommandRegistry} from './cliCommandRegistry.js';
import {ImportCommand} from './commands/import.js';

const registry = new CliCommandRegistry();

registry.registerCommand(new VersionCommand());
registry.registerCommand(new HelpCommand());
registry.registerCommand(new ImportCommand());

registry.processCommand(process.argv);
