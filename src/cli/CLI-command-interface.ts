export interface ICliCommand {
  readonly name: string;
  execute(...parameters: string[]): Promise<void>;
  printHelp(): Promise<void>;
}
