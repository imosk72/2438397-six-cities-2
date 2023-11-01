
import { Container } from 'inversify';
import { PinoLogger } from '../common/logging/pinoLogger.js';
import { Application } from './application.js';
import { ILogger } from '../common/logging/ILogger.js';
import { ConfigRegistry } from '../common/config/configRegistry.js';
import {AppTypes} from './appTypes.js';
import {applicationSchema} from './appSchema.js';

export async function bootstrapApplication() {
  const container = new Container();
  container.bind<ILogger>(AppTypes.LoggerInterface).to(PinoLogger).inSingletonScope();
  container.bind<ConfigRegistry>(AppTypes.ConfigRegistry).toConstantValue(
    new ConfigRegistry(container.get<ILogger>(AppTypes.LoggerInterface), applicationSchema)
  );
  container.bind<Application>(AppTypes.Application).to(Application).inSingletonScope();

  const application = container.get<Application>(AppTypes.Application);
  await application.init();
}
