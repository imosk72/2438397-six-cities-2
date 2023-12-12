import { inject, injectable } from 'inversify';
import {Model, Schema} from 'mongoose';

import {IDbClient} from '../../common/db/IDbClient.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { ILogger } from '../../common/logging/ILogger.js';
import {IOfferRepository} from './IOfferRepository.js';

const MAX_OFFERS_LIMIT = 20;
const SORT_DESC = -1;

@injectable()
export class OfferRepository implements IOfferRepository {
  private readonly logger: ILogger;
  private readonly OfferModel: typeof Model;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.OfferModelSchema) offerModelSchema: Schema,
  ) {
    this.logger = logger;
    this.OfferModel = dbClient.getConnection().model('Offer', offerModelSchema);
  }

  public async save(dto: OfferDto): Promise<OfferDto> {
    const model = await this.OfferModel.create(
      {
        ...dto,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        commentsCount: 0,
        commentsTotalRating: 0,
      }
    );
    this.logger.info(`New offer with id ${model._id} created`);
    return model;
  }

  public async findById(id: string): Promise<OfferDto | null> {
    this.logger.info(`Finding offer model by id ${id}`);
    return this.OfferModel.findOne({_id: id}).exec();
  }

  public async updateRating(id: string, rating: number): Promise<OfferDto | null> {
    this.logger.info(`Try to add ${rating} amount to offer ${id}`);
    return this.OfferModel
      .findByIdAndUpdate(id, {
        $inc: {commentCount: 1, commentsTotalRating: rating},
      })
      .exec();
  }

  public async deleteById(id: string): Promise<void> {
    await this.OfferModel.findByIdAndDelete(id).exec();
  }

  public async findAny(limit: number): Promise<OfferDto[] | null> {
    limit = limit ?? MAX_OFFERS_LIMIT;
    return this.OfferModel.find().sort({ createdAt: SORT_DESC }).limit(limit).exec();
  }

  public async findPremiumByCity(city: string): Promise<OfferDto[] | null> {
    return await this.OfferModel
      .find({ city: city, isPremium: true })
      .sort({ createdAt: SORT_DESC })
      .limit(MAX_OFFERS_LIMIT)
      .exec();
  }

  public async updateById(id: string, dto: OfferDto): Promise<void> {
    await this.OfferModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }
}
