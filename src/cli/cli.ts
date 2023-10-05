import {importCommand} from "./import";
import {versionCommand} from "./version";
import {helpCommand} from "./help";

const [, , command, options, ...args] = process.argv;
if (options && !options.startsWith("--")) {
  args.push(args[0]);
  args[0] = options;
}

if (command === "--import") {
  importCommand(options, args);
}
else if (command === "--version") {
  versionCommand();
}
else {
  helpCommand();
}
