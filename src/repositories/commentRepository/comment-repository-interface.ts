import { IEntityExistsRepository } from '../../common/repository/entity-exists-repository-interface.js';
import { CommentDto } from '../../models/comment/comment-DTO.js';

export interface ICommentRepository extends IEntityExistsRepository {
  save(dto: CommentDto): Promise<CommentDto | null>;

  findById(id: string): Promise<CommentDto | null>;
  findByOfferId(offerId: string, limit: number, offset: number): Promise<CommentDto[] | null>;
}
