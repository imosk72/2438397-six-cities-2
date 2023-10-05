import pkg from "../../package.json";

export function versionCommand() {
  console.log(pkg.version);
}
