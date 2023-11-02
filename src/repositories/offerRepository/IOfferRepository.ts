import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from '../../models/offer/offerEntity.js';
import { OfferDto } from '../../models/offer/offerDto.js';

export interface IOfferRepository {
  create(dto: OfferDto): Promise<DocumentType<OfferEntity>>;

  findById(id: string): Promise<DocumentType<OfferEntity> | null>;
}
