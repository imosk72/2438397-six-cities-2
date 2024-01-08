import { config } from 'dotenv';
import { inject, injectable } from 'inversify';
import convict from 'convict';
import { AppTypes } from '../../application/app-types.js';
import { ILogger } from '../logging/logger-interface.js';

@injectable()
export class ConfigRegistry {
  private readonly config: convict.Config<any>;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger, schema: convict.Config<any>) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      logger.error('Error occurred during parsing .env config file');
      throw new Error();
    }

    schema.load({});
    schema.validate({ allowed: 'strict' });

    this.config = schema;
  }

  public get(key: string): any {
    // @ts-ignore
    return this.config.get(key);
  }
}
