import { Schema } from 'mongoose';
import { Container } from 'inversify';
import { PinoLogger } from '../common/logging/pinoLogger.js';
import { Application } from './application.js';
import { ILogger } from '../common/logging/ILogger.js';
import { ConfigRegistry } from '../common/config/configRegistry.js';
import { IDbClient } from '../common/db/IDbClient.js';
import { MongoClient } from '../common/db/mongoClient.js';
import { IOfferRepository } from '../repositories/offerRepository/IOfferRepository.js';
import { OfferRepository } from '../repositories/offerRepository/OfferRepository.js';
import { IUserRepository } from '../repositories/userRepository/IUserRepository.js';
import { UserRepository } from '../repositories/userRepository/UserRepository.js';
import { UserModelSchema } from '../models/user/userModelSchema.js';
import { OfferModelSchema } from '../models/offer/offerModelSchema.js';
import { CommentModelSchema } from '../models/comment/commentModelSchema.js';
import { AppTypes } from './appTypes.js';
import { applicationConfigSchema } from './appConfigSchema.js';
import { ICommentRepository} from '../repositories/commentRepository/ICommentRepository.js';
import { CommentRepository } from '../repositories/commentRepository/CommentRepository.js';
import { UserController } from '../controllers/user/userController.js';
import { OfferController } from '../controllers/offer/offerController.js';
import { CommentController } from '../controllers/comments/commentController.js';
import { IExceptionFilter } from '../common/httpServer/exceptions/IExceptionFilter.js';
import { ExceptionFilter } from '../common/httpServer/exceptions/exceptionFilter.js';
import { TokenModelSchema } from '../models/user/tokenModelSchema.js';
import { TokenRepository } from '../repositories/tokenRepository/TokenRepository.js';
import { ITokenRepository } from '../repositories/tokenRepository/ITokenRepository.js';

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
