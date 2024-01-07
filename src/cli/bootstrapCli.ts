import { VersionCommand } from './commands/version.js';
import { HelpCommand } from './commands/help.js';
import { CliCommandRegistry } from './cliCommandRegistry.js';
import { ImportCommand } from './commands/import.js';
import { GenerateCommand } from './commands/generate.js';

export function bootstrapCliRegistry(): CliCommandRegistry {
  const registry = new CliCommandRegistry();

  registry.registerCommand(new VersionCommand());
  registry.registerCommand(new HelpCommand());
  registry.registerCommand(new ImportCommand());
  registry.registerCommand(new GenerateCommand());

  return registry;
}
