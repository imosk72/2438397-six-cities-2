import { inject, injectable } from 'inversify';
import {Model, Schema} from 'mongoose';

import {IDbClient} from '../../common/db/IDbClient.js';
import { UserDto } from '../../models/user/userDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { IUserRepository } from './IUserRepository.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { ConfigRegistry } from '../../common/config/configRegistry.js';
import { createSHA256Hash } from '../../utils/hashing.js';
import { OfferDto } from '../../models/offer/offerDto.js';

@injectable()
export class UserRepository implements IUserRepository {
  private readonly logger: ILogger;
  private readonly config: ConfigRegistry;
  private readonly UserModel: typeof Model;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.UserModelSchema) userModelSchema: Schema,
  ) {
    this.logger = logger;
    this.config = config;
    this.UserModel = dbClient.getConnection().model('User', userModelSchema);
  }

  public async save(dto: UserDto): Promise<UserDto> {
    const model = await this.UserModel.create(
      {
        ...dto,
        password: createSHA256Hash(dto.password, this.config?.get('SALT')),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
    this.logger.info(`New user with id ${model._id} created`);
    return model;
  }

  public async findById(id: string): Promise<UserDto | null> {
    this.logger.info(`Finding user model by id ${id}`);
    return this.UserModel.findOne({_id: id}).exec();
  }

  public async findByEmail(email: string): Promise<UserDto | null> {
    this.logger.info(`Finding user model by email ${email}`);
    return this.UserModel.findOne({email: email}).exec();
  }

  public async addToFavoriteOffer(userId: string, offerId: string): Promise<void> {
    await this.UserModel.findByIdAndUpdate(userId, { $push: { favorite: offerId }, new: true }).exec();
  }

  public async getFavourites(userId: string): Promise<OfferDto[]> {
    const offers = await this.UserModel.findById(userId).select('favorite');
    if (!offers) {
      return [];
    }

    return this.UserModel.find({ _id: { $in: offers } }).populate('offerId');
  }

  public async removeFavouriteOffer(userId: string, offerId: string): Promise<void> {
    await this.UserModel.findByIdAndUpdate(userId, { $pull: { favorite: offerId }, new: true });
  }

  public async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }
}
