import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import fileupload from 'express-fileupload';
import cors from 'cors';

import { ILogger } from '../common/logging/logger-interface.js';
import { AppTypes } from './app-types.js';
import { ConfigRegistry } from '../common/config/config-registry.js';
import { IDbClient } from '../common/db/db-client-interface.js';
import { getMongoConnectionUri } from '../utils/db.js';
import { IExceptionFilter } from '../common/httpServer/exceptions/exception-filter-interface.js';
import { UserController } from '../controllers/user/user-controller.js';
import { OfferController } from '../controllers/offer/offer-controller.js';
import { AuthenticateMiddleware } from '../common/httpServer/middleware/authentication.js';
import { ITokenRepository } from '../repositories/token-repository/token-repository-interface.js';
import { CommentController } from '../controllers/comments/comment-controller.js';

@injectable()
export class Application {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly dbClient: IDbClient;
  private readonly exceptionFilter: IExceptionFilter;
  private readonly userController: UserController;
  private readonly offerController: OfferController;
  private readonly commentController: CommentController;
  private readonly tokenRepository: ITokenRepository;
  private readonly server: Express;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.ExceptionFilter) exceptionFilter: IExceptionFilter,
    @inject(AppTypes.UserController) userController: UserController,
    @inject(AppTypes.OfferController) offerController: OfferController,
    @inject(AppTypes.CommentsController) commentController: CommentController,
    @inject(AppTypes.TokenRepository) tokenRepository: ITokenRepository,
  ) {
    this.logger = logger;
    this.config = config;
    this.dbClient = dbClient;
    this.exceptionFilter = exceptionFilter;
    this.userController = userController;
    this.offerController = offerController;
    this.commentController = commentController;
    this.tokenRepository = tokenRepository;

    this.server = express();
  }

  public async init() {
    this.logger.info('Application initialization...');
    this.logger.info(`Application will listen port: ${this.config.get('APP_PORT')}`);

    await this.initDb();

    await this.initMiddlewares();
    await this.initRoutes();
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

    this.logger.info(`Initializing http server on port ${port}`);

    this.server.listen(port);

    this.logger.info('Http server is ready');
  }

  private async initMiddlewares() {
    this.logger.info('Initializing middlewares');

    this.server.use(express.json());
    this.server.use(fileupload());
    this.server.use(cors());

    const authenticateMiddleware = new AuthenticateMiddleware(this.config.get('JWT_SECRET'), this.tokenRepository);
    this.server.use(authenticateMiddleware.execute.bind(authenticateMiddleware));

    this.logger.info('Middlewares initialized');
  }

  private async initExceptionFilters() {
    this.logger.info('Initializing exception filter');

    this.server.use(this.exceptionFilter.catch.bind(this.exceptionFilter));

    this.logger.info('Exception filter initialized');
  }

  private async initRoutes() {
    this.logger.info('Initializing routes');

    this.server.use('/offer', this.offerController.router);
    this.server.use('/user', this.userController.router);
    this.server.use('/comment', this.commentController.router);

    this.logger.info('Routes initialized');
  }
}
