import { Schema } from 'mongoose';
import { Container } from 'inversify';
import { PinoLogger } from '../common/logging/pino-logger';
import { Application } from './application.js';
import { ILogger } from '../common/logging/logger-interface';
import { ConfigRegistry } from '../common/config/config-registry';
import { IDbClient } from '../common/db/db-client-interface';
import { MongoClient } from '../common/db/mongo-client';
import { IOfferRepository } from '../repositories/offer-repository/offer-repository-interface';
import { OfferRepository } from '../repositories/offer-repository/offer-repository';
import { IUserRepository } from '../repositories/user-repository/user-repository-interface';
import { UserRepository } from '../repositories/user-repository/user-repository';
import { UserModelSchema } from '../models/user/user-model-schema';
import { OfferModelSchema } from '../models/offer/offer-model-schema';
import { CommentModelSchema } from '../models/comment/comment-model-schema';
import { AppTypes } from './app-types';
import { applicationConfigSchema } from './app-config-schema';
import { ICommentRepository} from '../repositories/commentRepository/comment-repository-interface';
import { CommentRepository } from '../repositories/commentRepository/comment-repository';
import { UserController } from '../controllers/user/user-controller';
import { OfferController } from '../controllers/offer/offer-controller';
import { CommentController } from '../controllers/comments/comment-controller';
import { IExceptionFilter } from '../common/httpServer/exceptions/exception-filter-interface';
import { ExceptionFilter } from '../common/httpServer/exceptions/exception-filter';
import { TokenModelSchema } from '../models/user/token-model-schema';
import { TokenRepository } from '../repositories/token-repository/token-repository';
import { ITokenRepository } from '../repositories/token-repository/token-repository-interface';

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
