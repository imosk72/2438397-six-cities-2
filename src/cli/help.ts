import pkg from "../../package.json";

export function helpCommand() {
  console.log(`NAME:\n    ${pkg.name} - ${pkg.description}\n`);
  console.log("USAGE:\n    cli.js command [command options] [arguments...]\n");
  console.log(`VERSION:\n    ${pkg.version}\n`);
  console.log("COMMANDS:");
  console.log(`    --help - Shows a list of commands`);
  console.log(`    --import - Imports data from TSV-file`);
  console.log(`    --version - Shows a version`);
}
