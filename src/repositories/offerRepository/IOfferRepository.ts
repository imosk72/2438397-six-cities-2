import { OfferDto } from '../../models/offer/offerDto.js';

export interface IOfferRepository {
  save(dto: OfferDto): Promise<OfferDto>;

  findById(id: string): Promise<OfferDto | null>;
}
