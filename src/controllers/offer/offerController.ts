import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { plainToInstance } from 'class-transformer';

import { RestController } from '../../common/httpServer/controller/restController.js';
import { AppTypes } from '../../application/appTypes.js';
import { HttpMethod } from '../../common/httpServer/httpMethod.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { HttpError } from '../../common/httpServer/exceptions/httpError.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import { IOfferRepository } from '../../repositories/offerRepository/IOfferRepository.js';
import {ValidateDtoMiddleware} from '../../common/httpServer/middleware/validateDto.js';
import {ValidateObjectIdMiddleware} from '../../common/httpServer/middleware/validateObjectId.js';
import {IsDocumentExistsMiddleware} from '../../common/httpServer/middleware/isDocumentExists.js';

@injectable()
export class OfferController extends RestController {
  private readonly offerRepository: IOfferRepository;

  constructor (
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.OfferRepository) offerRepository: IOfferRepository,
  ) {
    super(logger);
    this.offerRepository = offerRepository;

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'id'),
      ]
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(OfferDto)]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.get,
      middlewares: [new ValidateObjectIdMiddleware('id')],
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Put,
      handler: this.update,
      middlewares: [
        new ValidateObjectIdMiddleware('id'),
        new ValidateDtoMiddleware(OfferDto),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'id'),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [new ValidateObjectIdMiddleware('id')]
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium });
  }

  public async index({ params }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const limit = params.limit ? parseInt(`${params.limit}`, 10) : 20;
    const offers = await this.offerRepository.findAny(limit);
    this.ok(response, plainToInstance(OfferDto, offers, { excludeExtraneousValues: true }));
  }

  public async create(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, OfferDto>, response: Response,
  ): Promise<void> {
    const result = await this.offerRepository.save(body);
    this.created(response, result);
  }

  public async get({ params }: Request<Record<string, unknown>>, res: Response): Promise<void> {
    const offer = await this.offerRepository.findById(`${params.offerId}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${params.offerId} not found.`, 'OfferController');
    }

    this.ok(res, offer);
  }

  public async update(
    { params, body }: Request<Record<string, unknown>, Record<string, unknown>, OfferDto>,
    response: Response,
  ): Promise<void> {
    const offer = await this.offerRepository.findById(`${params.offerId}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${params.offerId} not found.`, 'OfferController');
    }

    const updatedOffer = await this.offerRepository.updateById(`${params.offerId}`, body);
    this.ok(response, updatedOffer);
  }

  public async delete({ params }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    await this.offerRepository.deleteById(`${params.offerId}`);
    this.noContent(response, `Offer ${params.offerId} was deleted.`);
  }

  public async getPremium({ params }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const offer = await this.offerRepository.findPremiumByCity(`${params.city}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offers by city ${params.city} not found.`, 'OfferController');
    }

    this.ok(response, offer);
  }
}
