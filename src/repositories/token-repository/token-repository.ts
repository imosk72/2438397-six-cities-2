import { inject, injectable } from 'inversify';
import { Model, Schema } from 'mongoose';

import { IDbClient } from '../../common/db/db-client-interface.js';
import { AppTypes } from '../../application/app-types.js';
import { ILogger } from '../../common/logging/logger-interface.js';
import { ITokenRepository } from './token-repository-interface.js';

@injectable()
export class TokenRepository implements ITokenRepository {
  private readonly logger: ILogger;
  private readonly dbClient: IDbClient;
  private readonly tokenModelSchema: Schema;
  private tokenModel: typeof Model | null;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.TokenModelSchema) userModelSchema: Schema,
  ) {
    this.logger = logger;
    this.dbClient = dbClient;
    this.tokenModelSchema = userModelSchema;
    this.tokenModel = null;
  }

  async exists(id: string): Promise<boolean> {
    const model = await this._getTokenModel().findOne({_id: id}).exec();
    return model !== null;
  }

  async getUserId(token: string): Promise<string | null> {
    const model = await this._getTokenModel().findOne({token: token}).exec();
    if (model === null) {
      return model;
    }
    return model.token;
  }

  async remove(token: string): Promise<void> {
    await this._getTokenModel().deleteOne({token: token});
    this.logger.info('Token removed');
  }

  async save(dto: { token: string; userId: string }): Promise<void> {
    await this._getTokenModel().create({...dto});
    this.logger.info('Token saved');
  }

  private _getTokenModel(): typeof Model {
    if (this.tokenModel === null) {
      this.tokenModel = this.dbClient.getConnection().model('Token', this.tokenModelSchema);
    }
    return this.tokenModel;
  }
}
