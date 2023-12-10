import { inject, injectable } from 'inversify';
import {Model, Schema} from 'mongoose';

import {IDbClient} from '../../common/db/IDbClient.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { ILogger } from '../../common/logging/ILogger.js';
import {IOfferRepository} from './IOfferRepository.js';

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
}
