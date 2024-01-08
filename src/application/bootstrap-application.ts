import { Schema } from 'mongoose';
import { Container } from 'inversify';
import { PinoLogger } from '../common/logging/pino-logger.js';
import { Application } from './application.js';
import { ILogger } from '../common/logging/logger-interface.js';
import { ConfigRegistry } from '../common/config/config-registry.js';
import { IDbClient } from '../common/db/db-client-interface.js';
import { MongoClient } from '../common/db/mongo-client.js';
import { IOfferRepository } from '../repositories/offer-repository/offer-repository-interface.js';
import { OfferRepository } from '../repositories/offer-repository/offer-repository.js';
import { IUserRepository } from '../repositories/user-repository/user-repository-interface.js';
import { UserRepository } from '../repositories/user-repository/user-repository.js';
import { UserModelSchema } from '../models/user/user-model-schema.js';
import { OfferModelSchema } from '../models/offer/offer-model-schema.js';
import { CommentModelSchema } from '../models/comment/comment-model-schema.js';
import { AppTypes } from './app-types.js';
import { applicationConfigSchema } from './app-config-schema.js';
import { ICommentRepository} from '../repositories/commentRepository/comment-repository-interface.js';
import { CommentRepository } from '../repositories/commentRepository/comment-repository.js';
import { UserController } from '../controllers/user/user-controller.js';
import { OfferController } from '../controllers/offer/offer-controller.js';
import { CommentController } from '../controllers/comments/comment-controller.js';
import { IExceptionFilter } from '../common/httpServer/exceptions/exception-filter-interface.js';
import { ExceptionFilter } from '../common/httpServer/exceptions/exception-filter.js';
import { TokenModelSchema } from '../models/user/token-model-schema.js';
import { TokenRepository } from '../repositories/token-repository/token-repository.js';
import { ITokenRepository } from '../repositories/token-repository/token-repository-interface.js';

export async function bootstrapApplication() {
  const container = new Container();
  container.bind<ILogger>(AppTypes.LoggerInterface).to(PinoLogger).inSingletonScope();
  container.bind<ConfigRegistry>(AppTypes.ConfigRegistry).toConstantValue(
    new ConfigRegistry(container.get<ILogger>(AppTypes.LoggerInterface), applicationConfigSchema)
  );
  container.bind<IDbClient>(AppTypes.DbClient).to(MongoClient).inSingletonScope();
  container.bind<Schema>(AppTypes.UserModelSchema).toConstantValue(UserModelSchema);
  container.bind<Schema>(AppTypes.OfferModelSchema).toConstantValue(OfferModelSchema);
  container.bind<Schema>(AppTypes.CommentModelSchema).toConstantValue(CommentModelSchema);
  container.bind<Schema>(AppTypes.TokenModelSchema).toConstantValue(TokenModelSchema);
  container.bind<IOfferRepository>(AppTypes.OfferRepository).to(OfferRepository).inSingletonScope();
  container.bind<IUserRepository>(AppTypes.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<ICommentRepository>(AppTypes.CommentRepository).to(CommentRepository).inSingletonScope();
  container.bind<ITokenRepository>(AppTypes.TokenRepository).to(TokenRepository).inSingletonScope();
  container.bind<Application>(AppTypes.Application).to(Application).inSingletonScope();
  container.bind<IExceptionFilter>(AppTypes.ExceptionFilter).to(ExceptionFilter).inSingletonScope();
  container.bind<UserController>(AppTypes.UserController).to(UserController).inSingletonScope();
  container.bind<OfferController>(AppTypes.OfferController).to(OfferController).inSingletonScope();
  container.bind<CommentController>(AppTypes.CommentsController).to(CommentController).inSingletonScope();

  const application = container.get<Application>(AppTypes.Application);
  await application.init();
}
