import { inject, injectable } from 'inversify';
import {Model, Schema} from 'mongoose';

import { IDbClient } from '../../common/db/IDbClient.js';
import { CommentDto } from '../../models/comment/commentDto.js';
import { AppTypes } from '../../application/appTypes.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { ICommentRepository } from './ICommentRepository.js';
import { convertMaybeDbModelToDto, convertModelsArrayToDto } from '../../utils/typeConverters.js';

const MAX_COMMENTS_COUNT = 20;
const SORT_DESC = -1;

@injectable()
export class CommentRepository implements ICommentRepository {
  private readonly logger: ILogger;
  private readonly dbClient: IDbClient;
  private readonly commentModelSchema: Schema;
  private commentModel: typeof Model | null;


  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.DbClient) dbClient: IDbClient,
    @inject(AppTypes.CommentModelSchema) commentModelSchema: Schema,
  ) {
    this.logger = logger;
    this.dbClient = dbClient;
    this.commentModelSchema = commentModelSchema;
    this.commentModel = null;
  }

  public async save(dto: CommentDto): Promise<CommentDto | null> {
    const model = await this._getCommentModel().create(
      {
        ...dto
      }
    );
    this.logger.info(`New comment with id ${model._id} created`);
    return convertMaybeDbModelToDto(CommentDto, model);
  }

  public async findById(id: string): Promise<CommentDto | null> {
    this.logger.info(`Finding comment model by id ${id}`);
    const model = await this._getCommentModel().findOne({_id: id}).exec();
    return convertMaybeDbModelToDto(CommentDto, model);
  }

  public async exists(id: string): Promise<boolean> {
    return await this.findById(id) !== null;
  }

  async findByOfferId(offerId: string, limit: number, offset: number): Promise<CommentDto[] | null> {
    this.logger.info(`Finding comments of offer ${offerId}`);
    limit = limit ?? MAX_COMMENTS_COUNT;
    offset = offset ?? 0;

    const models = await this._getCommentModel()
      .find({offerId: offerId})
      .sort({ date: SORT_DESC })
      .skip(offset)
      .limit(limit)
      .exec();

    return convertModelsArrayToDto(CommentDto, models);
  }

  private _getCommentModel(): typeof Model {
    if (this.commentModel === null) {
      this.commentModel = this.dbClient.getConnection().model('Comment', this.commentModelSchema);
    }
    return this.commentModel;
  }
}
