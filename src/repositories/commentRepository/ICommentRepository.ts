import { CommentDto } from '../../models/comment/commentDto.js';

export interface ICommentRepository {
  save(dto: CommentDto): Promise<CommentDto>;

  findById(id: string): Promise<CommentDto | null>;
}
