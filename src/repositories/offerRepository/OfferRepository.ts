import { inject, injectable } from 'inversify';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from '../../models/offer/offerEntity.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { ILogger } from '../../common/logging/ILogger.js';
import {IOfferRepository} from './IOfferRepository.js';

@injectable()
export class OfferRepository implements IOfferRepository {
  private readonly logger: ILogger;
  private readonly offerModel: types.ModelType<OfferEntity>;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.OfferModel) offerModel: types.ModelType<OfferEntity>,
  ) {
    this.logger = logger;
    this.offerModel = offerModel;
  }

  public async create(dto: OfferDto): Promise<DocumentType<OfferEntity>> {

    const model = await this.offerModel.create(dto);
    this.logger.info(`New offer with id ${model.id} created`);

    return model;
  }

  public async findById(id: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findOne({ id });
  }

  public async findByEmail(email: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findOne({ email });
  }
}
