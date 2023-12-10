import { inject, injectable } from 'inversify';
import {Model, Schema} from 'mongoose';

import { IDbClient } from '../../common/db/IDbClient.js';
import { CommentDto } from '../../models/comment/commentDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { ICommentRepository } from './ICommentRepository.js';

@injectable()
export class CommentRepository implements ICommentRepository {
  private readonly logger: ILogger;
  private readonly CommentModel: typeof Model;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.CommentModelSchema) commentModelSchema: Schema,
  ) {
    this.logger = logger;
    this.CommentModel = dbClient.getConnection().model('Comment', commentModelSchema);
  }

  public async save(dto: CommentDto): Promise<CommentDto> {
    const model = await this.CommentModel.create(
      {
        ...dto
      }
    );
    this.logger.info(`New comment with id ${model._id} created`);
    return model;
  }

  public async findById(id: string): Promise<CommentDto | null> {
    this.logger.info(`Finding comment model by id ${id}`);
    return this.CommentModel.findOne({_id: id}).exec();
  }
}
