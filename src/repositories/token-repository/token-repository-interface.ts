import {IEntityExistsRepository} from '../../common/repository/entity-exists-repository-interface';

export interface ITokenRepository extends IEntityExistsRepository {
  save(dto: {token: string, userId: string}): Promise<void>;
  remove(token: string): Promise<void>
  getUserId(token: string): Promise<string | null>
}
