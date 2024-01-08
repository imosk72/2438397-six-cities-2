import { config } from 'dotenv';
import { inject, injectable } from 'inversify';
import convict from 'convict';
import { AppTypes } from '../../application/app-types.js';
import { ILogger } from '../logging/logger-interface.js';
import { AppConfigType } from '../../application/app-config-schema.js';

@injectable()
export class ConfigRegistry {
  private readonly config: AppConfigType;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger, schema: convict.Config<AppConfigType>) {
    const parsedOutput = config();

    if (parsedOutput.error) {
      logger.error('Error occurred during parsing .env config file');
      throw new Error();
    }

    schema.load({});
    schema.validate({ allowed: 'strict' });

    this.config = schema.getProperties();
  }

  public get<T extends keyof AppConfigType>(key: T): AppConfigType[T] {
    return this.config[key];
  }
}
