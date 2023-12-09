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
  private readonly UserModel: typeof Model;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.OfferModelSchema) offerModelSchema: Schema,
  ) {
    this.logger = logger;
    this.UserModel = dbClient.getConnection().model('Offer', offerModelSchema);
  }

  public async save(dto: OfferDto): Promise<OfferDto> {
    const model = await this.UserModel.create(
      {
        ...dto,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );
    this.logger.info(`New offer with id ${model._id} created`);
    return model;
  }

  public async findById(id: string): Promise<OfferDto | null> {
    this.logger.info(`Finding offer model by id ${id}`);
    return this.UserModel.findOne({_id: id}).exec();
  }
}
