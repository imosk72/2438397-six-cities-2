import { inject, injectable } from 'inversify';
import { Model, Schema } from 'mongoose';

import {IDbClient} from '../../common/db/db-client-interface.js';
import { OfferDto } from '../../models/offer/offer-DTO.js';
import { AppTypes } from '../../application/app-types.js';
import { ILogger } from '../../common/logging/logger-interface.js';
import { IOfferRepository } from './offer-repository-interface.js';
import { convertMaybeDbModelToDto, convertModelsArrayToDto } from '../../utils/type-converters.js';

const MAX_OFFERS_LIMIT = 20;
const SORT_DESC = -1;

@injectable()
export class OfferRepository implements IOfferRepository {
  private readonly logger: ILogger;
  private readonly dbClient: IDbClient;
  private readonly offerModelSchema: Schema;
  private offerModel: typeof Model | null;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.OfferModelSchema) offerModelSchema: Schema,
  ) {
    this.logger = logger;
    this.dbClient = dbClient;
    this.offerModelSchema = offerModelSchema;
    this.offerModel = null;
  }

  public async save(dto: OfferDto): Promise<OfferDto | null> {
    const model = await this._getOfferModel().create(
      {
        ...dto,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        commentsCount: 0,
        commentsTotalRating: 0,
      }
    );
    this.logger.info(`New offer with id ${model._id} created`);
    return convertMaybeDbModelToDto(OfferDto, model);
  }

  public async findById(id: string): Promise<OfferDto | null> {
    this.logger.info(`Finding offer model by id ${id}`);
    const model = await this._getOfferModel().findOne({_id: id}).exec();
    return convertMaybeDbModelToDto(OfferDto, model);
  }

  public async updateRating(id: string, rating: number): Promise<OfferDto | null> {
    this.logger.info(`Try to add ${rating} amount to offer ${id}`);
    const model = await this._getOfferModel()
      .findByIdAndUpdate(id, {
        $inc: {commentsCount: 1, commentsTotalRating: rating},
      })
      .exec();
    return convertMaybeDbModelToDto(OfferDto, model);
  }

  public async deleteById(id: string): Promise<void> {
    await this._getOfferModel().findByIdAndDelete(id).exec();
  }

  public async findAny(limit: number, offset: number): Promise<OfferDto[] | null> {
    limit = limit ?? MAX_OFFERS_LIMIT;
    offset = offset ?? 0;
    const models = await this._getOfferModel()
      .find()
      .sort({ createdAt: SORT_DESC })
      .skip(offset)
      .limit(limit)
      .exec();
    return convertModelsArrayToDto(OfferDto, models);
  }

  public async findPremiumByCity(city: string, limit: number, offset: number): Promise<OfferDto[] | null> {
    limit = limit ?? MAX_OFFERS_LIMIT;
    offset = offset ?? 0;

    const models = await this._getOfferModel()
      .find({ city: city, isPremium: true })
      .sort({ createdAt: SORT_DESC })
      .skip(offset)
      .limit(limit)
      .exec();
    return convertModelsArrayToDto(OfferDto, models);
  }

  public async updateById(id: string, dto: OfferDto): Promise<void> {
    await this._getOfferModel().findByIdAndUpdate(
      id, {...dto, updatedAt: Date.now()}, { new: true }
    ).exec();
  }

  public async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }

  private _getOfferModel(): typeof Model {
    if (this.offerModel === null) {
      this.offerModel = this.dbClient.getConnection().model('Offer', this.offerModelSchema);
    }
    return this.offerModel;
  }
}
