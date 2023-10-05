import chalk from "chalk";
import pkg from "../../package.json";

export function helpCommand() {
  console.log(`NAME:\n    ${pkg.name} - ${pkg.description}\n`);
  console.log(`USAGE:\n    ${chalk.bold("cli.js")} command [command options] [arguments...]\n`);
  console.log(`VERSION:\n    ${pkg.version}\n`);
  console.log("COMMANDS:");
  console.log(`    ${chalk.bold("cli.js")} - Shows a list of commands`);
  console.log(`    ${chalk.bold("cli.js")} - Imports data from TSV-file`);
  console.log(`    ${chalk.bold("cli.js")} - Shows a version`);
}
