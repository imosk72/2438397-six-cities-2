import {importCommand} from './import.js';
import {versionCommand} from './version.js';
import {helpCommand} from './help.js';

const [, , command, options, ...args] = process.argv;
if (!options.startsWith('--')) {
  args.push(options);
}

if (command === '--import') {
  importCommand(options, args);
} else if (command === '--version') {
  versionCommand();
} else {
  helpCommand();
}
