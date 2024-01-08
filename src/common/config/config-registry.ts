import { config } from 'dotenv';
import {inject, injectable} from 'inversify';
import convict from 'convict';
import {AppTypes} from '../../application/app-types.js';
import {ILogger} from '../logging/logger-interface.js';

@injectable()
export class ConfigRegistry {
  private readonly config: convict.Format;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger, schema: convict.Format) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      logger.error('Error occurred during parsing .env config file');
      throw new Error();
    }

    schema.load({});
    schema.validate({ allowed: 'strict' });

    this.config = schema.getProperties();
  }

  public get(key: string): any {
    return this.config[key];
  }
}
