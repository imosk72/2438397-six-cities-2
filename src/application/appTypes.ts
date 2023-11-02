export const AppTypes = {
  Application: Symbol.for('Application'),
  ConfigRegistry: Symbol.for('ConfigRegistry'),
  LoggerInterface: Symbol.for('LoggerInterface'),
  DbClient: Symbol.for('DbClient'),
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  UserModel: Symbol.for('UserModel'),
  OfferModel: Symbol.for('OfferModel'),
} as const;
