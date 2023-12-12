import { inject, injectable } from 'inversify';
import express, {Express} from 'express';

import {ILogger} from '../common/logging/ILogger.js';
import {AppTypes} from './appTypes.js';
import {ConfigRegistry} from '../common/config/configRegistry.js';
import {IDbClient} from '../common/db/IDbClient.js';
import {getMongoConnectionUri} from '../utils/db.js';
import {IExceptionFilter} from '../common/httpServer/exceptions/IExceptionFilter.js';
import {UserController} from '../controllers/user/userController.js';
import {OfferController} from '../controllers/offer/offerController.js';

@injectable()
export class Application {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly dbClient: IDbClient;
  private readonly exceptionFilter: IExceptionFilter;
  private readonly userController: UserController;
  private readonly offerController: OfferController;
  private readonly server: Express;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.ExceptionFilter) exceptionFilter: IExceptionFilter,
    @inject(AppTypes.UserController) userController: UserController,
    @inject(AppTypes.OfferController) offerController: OfferController,
  ) {
    this.logger = logger;
    this.config = config;
    this.dbClient = dbClient;
    this.exceptionFilter = exceptionFilter;
    this.userController = userController;
    this.offerController = offerController;

    this.server = express();
  }

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Application will listen port: ${this.config.get('APP_PORT')}`);

    await this.initDb();

    await this.initRoutes();
    await this.initMiddlewares();
    await this.initExceptionFilters();
    await this.initHttpServer();
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

  private async initHttpServer() {
    const port = this.config.get('APP_PORT');

    this.logger.info(`Initializing http server on port ${port}}`);

    this.server.listen(port);

    this.logger.info('Http server is ready');
  }

  private async initMiddlewares() {
    this.logger.info('Initializing middlewares');

    this.server.use(express.json());

    this.logger.info('Middlewares initialized');
  }

  private async initExceptionFilters() {
    this.logger.info('Initializing exception filter');

    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));

    this.logger.info('Exception filter initialized');
  }

  private async initRoutes() {
    this.logger.info('Initializing routes');

    this.server.use('/offers', this.offerController.router);
    this.server.use('/users', this.userController.router);

    this.logger.info('Routes initialized');
  }
}
