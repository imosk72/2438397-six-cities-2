import { OfferDto } from '../../models/offer/offerDto.js';

export interface IOfferRepository {
  save(dto: OfferDto): Promise<OfferDto>;

  findById(id: string): Promise<OfferDto | null>;

  updateRating(id: string, rating: number): Promise<OfferDto | null>;
  findAny(limit: number): Promise<OfferDto[] | null>;
  updateById(id: string, dto: OfferDto): Promise<void>;
  deleteById(id: string): Promise<void>;
  findPremiumByCity(city: string): Promise<OfferDto[] | null>;
}
