import { inject, injectable } from 'inversify';
import {ILogger} from '../common/logging/ILogger.js';
import {AppTypes} from './appTypes.js';
import {ConfigRegistry} from '../common/config/configRegistry.js';
import {IDbClient} from '../common/db/IDbClient.js';
import {getMongoConnectionUri} from '../utils/db';

@injectable()
export class Application {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly dbClient: IDbClient;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
  ) {
    this.logger = logger;
    this.config = config;
    this.dbClient = dbClient;
  }

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Application will listen port: ${this.config.get('APP_PORT')}`);

    await this.initDb();
  }

  private async initDb() {
    const dbHost = this.config.get('DB_HOST');
    const dbPort = this.config.get('DB_PORT');
    const dbName = this.config.get('DB_NAME');
    const dbUser = this.config.get('DB_USER');
    const dbPassword = this.config.get('DB_PASSWORD');

    this.logger.info(`Trying to connect to database ${dbName} on host ${dbHost}:${dbPort}`);

    await this.dbClient.connect(getMongoConnectionUri(dbHost, dbPort, dbName, dbUser, dbPassword));

    this.logger.info('Connected to database');
  }
}
