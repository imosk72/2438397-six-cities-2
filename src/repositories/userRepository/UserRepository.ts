import { inject, injectable } from 'inversify';
import { Model, Schema } from 'mongoose';

import { IDbClient } from '../../common/db/IDbClient.js';
import { UserDto } from '../../models/user/userDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { IUserRepository } from './IUserRepository.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { ConfigRegistry } from '../../common/config/configRegistry.js';
import { createSHA256Hash } from '../../utils/hashing.js';
import { convertMaybeDbModelToDto } from '../../utils/typeConverters.js';
import { CreateUserRequest } from '../../models/user/userRequests.js';

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly dbClient: IDbClient;
  private readonly userModelSchema: Schema;
  private userModel: typeof Model | null;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.UserModelSchema) userModelSchema: Schema,
  ) {
    this.logger = logger;
    this.config = config;
    this.dbClient = dbClient;
    this.userModelSchema = userModelSchema;
    this.userModel = null;
  }

  public async save(dto: CreateUserRequest): Promise<UserDto | null> {
    const model = await this._getUserModel().create(
      {
        ...dto,
        password: createSHA256Hash(dto.password, this.config?.get('SALT')),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
    this.logger.info(`New user with id ${model._id} created`);
    return convertMaybeDbModelToDto(UserDto, model);
  }

  public async findById(id: string): Promise<UserDto | null> {
    this.logger.info(`Finding user model by id ${id}`);
    const model = await this._getUserModel().findOne({_id: id}).exec();
    return convertMaybeDbModelToDto(UserDto, model);
  }

  public async findByEmail(email: string): Promise<UserDto | null> {
    this.logger.info(`Finding user model by email ${email}`);
    const model = await this._getUserModel().findOne({email: email}).exec();
    return convertMaybeDbModelToDto(UserDto, model);
  }

  public async addToFavoriteOffer(userId: string, offerId: string): Promise<void> {
    await this._getUserModel().findByIdAndUpdate({_id: userId}, { $push: { favourite: offerId }, new: true }).exec();
  }

  public async getFavourites(userId: string): Promise<string[]> {
    const offers = await this._getUserModel().findById(userId).select('favourite').exec();
    if (!offers) {
      return [];
    }

    const model = await this._getUserModel().findById(userId);
    return model.favourite;
  }

  public async removeFavouriteOffer(userId: string, offerId: string): Promise<void> {
    await this._getUserModel().findByIdAndUpdate({_id: userId}, { $pull: { favourite: offerId }, new: true });
  }

  public async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }

  public async getHashedPassword(userId: string): Promise<string | null> {
    this.logger.info(`Finding user password by id ${userId}`);
    const model = await this._getUserModel().findOne({_id: userId}).exec();
    if (model === null) {
      return null;
    }
    return model.password;
  }

  public async updateAvatar(id: string, avatar: string): Promise<UserDto | null> {
    this.logger.info(`Try to update avatar to user ${id}`);
    const model = await this._getUserModel()
      .findByIdAndUpdate(id, {
        avatar: avatar,
      })
      .exec();
    return convertMaybeDbModelToDto(UserDto, model);
  }

  private _getUserModel(): typeof Model {
    if (this.userModel === null) {
      this.userModel = this.dbClient.getConnection().model('User', this.userModelSchema);
    }
    return this.userModel;
  }
}
