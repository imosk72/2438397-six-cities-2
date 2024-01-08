import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';

import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';
import { RestController } from '../../common/httpServer/controller/rest-controller';
import { AppTypes } from '../../application/app-types';
import { HttpMethod } from '../../common/httpServer/HTTP-method';
import { ILogger } from '../../common/logging/logger-interface';
import { ICommentRepository } from '../../repositories/commentRepository/comment-repository-interface';
import { CommentDto } from '../../models/comment/comment-DTO';
import { ValidateDtoMiddleware } from '../../common/httpServer/middleware/validate-DTO';
import { PrivateRouteMiddleware } from '../../common/httpServer/middleware/authentication.js';
import { CreateCommentRequest } from '../../models/comment/comment-requests';
import { ValidateObjectIdMiddleware } from '../../common/httpServer/middleware/validate-object-id';
import { IsDocumentExistsMiddleware } from '../../common/httpServer/middleware/is-document-exists';
import { IOfferRepository } from '../../repositories/offer-repository/offer-repository-interface';
import {HttpError} from '../../common/httpServer/exceptions/HTTP-error';

const { Types } = mongoose;

@injectable()
export class CommentController extends RestController {
  private readonly commentsRepository: ICommentRepository;
  private readonly offerRepository: IOfferRepository;

  constructor(
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.CommentRepository) commentsRepository: ICommentRepository,
    @inject(AppTypes.OfferRepository) offerRepository: IOfferRepository,
  ) {
    super(logger);
    this.commentsRepository = commentsRepository;
    this.offerRepository = offerRepository;

    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateDtoMiddleware(CreateCommentRequest),
      ],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.getByOfferId,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(offerRepository, 'Offer', 'offerId'),
      ]
    });
  }

  public async create({ body, user }: Request<object, object, CommentDto>, response: Response): Promise<void> {
    if (!Types.ObjectId.isValid(body.offerId)) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `${body.offerId} is not valid id`, 'OfferController');
    }
    const offer = await this.offerRepository.exists(`${body.offerId}`);
    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${body.offerId} not found.`, 'OfferController');
    }

    const comment = await this.commentsRepository.save({...body, userId: user.id});
    await this.offerRepository.updateRating(body.offerId, body.rating);
    this.created(response, comment);
  }

  public async getByOfferId({ params, query }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const limit = query.limit ? parseInt(`${query.limit}`, 10) : 50;
    const offset = query.offset ? parseInt(`${query.offset}`, 10) : 0;

    const comments = await this.commentsRepository.findByOfferId(`${params.offerId}`, limit, offset);
    this.ok(response, comments);
  }
}
