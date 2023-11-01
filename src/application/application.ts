import { inject, injectable } from 'inversify';
import {ILogger} from '../common/logging/ILogger.js';
import {AppTypes} from './appTypes.js';
import {ConfigRegistry} from '../common/config/configRegistry.js';

@injectable()
export class Application {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
  ) {
    this.logger = logger;
    this.config = config;
  }

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Application will listen port: ${this.config.get('APP_PORT')}`);
  }
}
