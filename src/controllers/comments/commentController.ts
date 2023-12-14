import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { plainToInstance } from 'class-transformer';

import { RestController } from '../../common/httpServer/controller/restController.js';
import { AppTypes } from '../../application/appTypes.js';
import { HttpMethod } from '../../common/httpServer/httpMethod.js';
import { ILogger } from '../../common/logging/ILogger.js';
import {ICommentRepository} from '../../repositories/commentRepository/ICommentRepository.js';
import {CommentDto} from "../../models/comment/commentDto";

@injectable()
export class CommentController extends RestController {
  private commentsRepository: ICommentRepository;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.UserRepository) commentsRepository: ICommentRepository,
  ) {
    super(logger);
    this.commentsRepository = commentsRepository;

    this.addRoute({path: '/:commentId', method: HttpMethod.Post, handler: this.create});
  }

  public async create({ body }: Request<object, object, CommentDto>, response: Response): Promise<void> {
    const result = await this.commentsRepository.save(body);
    this.created(response, plainToInstance(CommentDto, result, { excludeExtraneousValues: true }));
  }
}
