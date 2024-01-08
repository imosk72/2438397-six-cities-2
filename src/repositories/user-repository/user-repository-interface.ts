import {IEntityExistsRepository} from '../../common/repository/entity-exists-repository-interface.js';
import { UserDto } from '../../models/user/user-DTO.js';

export interface IUserRepository extends IEntityExistsRepository {
  save(dto: UserDto): Promise<UserDto | null>;
  findById(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
  addToFavoriteOffer(userId: string, offerId: string): Promise<void>;
  removeFavouriteOffer(userId: string, offerId: string): Promise<void>;
  getFavourites(userId: string): Promise<string[]>;
  getHashedPassword(userId: string): Promise<string | null>;
  updateAvatar(id: string, avatar: string): Promise<UserDto | null>;
}
