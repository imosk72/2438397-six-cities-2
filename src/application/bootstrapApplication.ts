import { types, getModelForClass } from '@typegoose/typegoose';
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
import { UserEntity } from '../models/user/userEntity.js';
import { OfferEntity } from '../models/offer/offerEntity.js';
import { AppTypes } from './appTypes.js';
import { applicationConfigSchema } from './appConfigSchema.js';

export async function bootstrapApplication() {
  const container = new Container();
  container.bind<ILogger>(AppTypes.LoggerInterface).to(PinoLogger).inSingletonScope();
  container.bind<ConfigRegistry>(AppTypes.ConfigRegistry).toConstantValue(
    new ConfigRegistry(container.get<ILogger>(AppTypes.LoggerInterface), applicationConfigSchema)
  );
  container.bind<IDbClient>(AppTypes.DbClient).to(MongoClient).inSingletonScope();
  container.bind<types.ModelType<UserEntity>>(AppTypes.UserModel).toConstantValue(getModelForClass(UserEntity));
  container.bind<types.ModelType<OfferEntity>>(AppTypes.OfferModel).toConstantValue(getModelForClass(OfferEntity));
  container.bind<IOfferRepository>(AppTypes.OfferRepository).to(OfferRepository).inSingletonScope();
  container.bind<IUserRepository>(AppTypes.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<Application>(AppTypes.Application).to(Application).inSingletonScope();

  const application = container.get<Application>(AppTypes.Application);
  await application.init();
}
