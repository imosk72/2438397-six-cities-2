import { IEntityExistsRepository } from '../../common/repository/IEntityExistsRepository.js';
import { OfferDto } from '../../models/offer/offerDto.js';

export interface IOfferRepository extends IEntityExistsRepository {
  save(dto: OfferDto): Promise<OfferDto | null>;

  findById(id: string): Promise<OfferDto | null>;

  updateRating(id: string, rating: number): Promise<OfferDto | null>;
  findAny(limit: number, offset: number): Promise<OfferDto[] | null>;
  updateById(id: string, dto: OfferDto): Promise<void>;
  deleteById(id: string): Promise<void>;
  findPremiumByCity(city: string, limit: number, offset: number): Promise<OfferDto[] | null>;
}
