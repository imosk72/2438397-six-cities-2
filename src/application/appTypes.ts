export const AppTypes = {
  Application: Symbol.for('Application'),
  ConfigRegistry: Symbol.for('ConfigRegistry'),
  LoggerInterface: Symbol.for('LoggerInterface'),
  DbClient: Symbol.for('DbClient'),
  UserRepository: Symbol.for('UserRepository'),
  OfferRepository: Symbol.for('OfferRepository'),
  CommentRepository: Symbol.for('CommentRepository'),
  UserModelSchema: Symbol.for('UserModelSchema'),
  OfferModelSchema: Symbol.for('OfferModelSchema'),
  CommentModelSchema: Symbol.for('CommentModelSchema'),
} as const;
