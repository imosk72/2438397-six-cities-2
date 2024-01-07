import { inject, injectable } from 'inversify';
import { Request, Response} from 'express';
import { StatusCodes } from 'http-status-codes';

import { RestController } from '../../common/httpServer/controller/restController.js';
import { AppTypes } from '../../application/appTypes.js';
import { HttpMethod } from '../../common/httpServer/httpMethod.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { HttpError } from '../../common/httpServer/exceptions/httpError.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import { IOfferRepository } from '../../repositories/offerRepository/IOfferRepository.js';
import { ValidateDtoMiddleware } from '../../common/httpServer/middleware/validateDto.js';
import { ValidateObjectIdMiddleware } from '../../common/httpServer/middleware/validateObjectId.js';
import { IsDocumentExistsMiddleware } from '../../common/httpServer/middleware/isDocumentExists.js';
import { PrivateRouteMiddleware } from '../../common/httpServer/middleware/authentication.js';
import { IUserRepository } from '../../repositories/userRepository/IUserRepository.js';
import { CreateOfferRequest } from '../../models/offer/offerRequests.js';

@injectable()
export class OfferController extends RestController {
  private readonly offerRepository: IOfferRepository;
  private readonly userRepository: IUserRepository;

  constructor (
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.OfferRepository) offerRepository: IOfferRepository,
    @inject(AppTypes.UserRepository) userRepository: IUserRepository,
  ) {
    super(logger);
    this.offerRepository = offerRepository;
    this.userRepository = userRepository;

    this.addRoute({
      path: '/',
      method: HttpMethod.Get,
      handler: this.index,
    });
    this.addRoute({
      path: '/',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new PrivateRouteMiddleware(), new ValidateDtoMiddleware(CreateOfferRequest)]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Get,
      handler: this.get,
      middlewares: [
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Put,
      handler: this.update,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'offerId'),
        new ValidateDtoMiddleware(CreateOfferRequest),
      ]
    });
    this.addRoute({
      path: '/:offerId',
      method: HttpMethod.Delete,
      handler: this.delete,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({ path: '/premium/:city', method: HttpMethod.Get, handler: this.getPremium });
  }

  public async index({ query, user }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const limit = query.limit ? parseInt(`${query.limit}`, 10) : 60;
    const offset = query.offset ? parseInt(`${query.offset}`, 10) : 0;
    const offers = await this.offerRepository.findAny(limit, offset);
    if (offers) {
      await this._updateFavourite(offers, user?.id);
    }
    this.ok(response, offers);
  }

  public async create(
    { body, user }: Request<Record<string, unknown>, Record<string, unknown>, OfferDto>, response: Response,
  ): Promise<void> {
    let needAddToFavourite = false;
    if (body.isFavourite) {
      needAddToFavourite = true;
      body.isFavourite = false;
    }
    const offer = await this.offerRepository.save({...body, authorId: user.id});
    if (offer) {
      if (needAddToFavourite) {
        await this.userRepository.addToFavoriteOffer(user.id, offer.id || '');
      }
      offer.isFavourite = true;
    }
    this.created(response, offer);
  }

  public async get({ params, user }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const offer = await this.offerRepository.findById(`${params.offerId}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${params.offerId} not found.`, 'OfferController');
    }
    await this._updateFavourite([offer], user?.id);
    this.ok(response, offer);
  }

  public async update(
    { params, body, user }: Request<Record<string, unknown>, Record<string, unknown>, OfferDto>,
    response: Response,
  ): Promise<void> {
    const offer = await this.offerRepository.findById(`${params.offerId}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${params.offerId} not found.`, 'OfferController');
    }
    if (offer.authorId !== user.id) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Only author can edit offer', 'OfferController');
    }
    await this.offerRepository.updateById(`${params.offerId}`, {...body, authorId: user.id});
    this.noContent(response);
  }

  public async delete({ params, user }: Request<Record<string, unknown>>, response: Response): Promise<void> {
    const offer = await this.offerRepository.findById(`${params.offerId}`);

    if (!offer) {
      throw new HttpError(StatusCodes.NOT_FOUND, `Offer with id ${params.offerId} not found.`, 'OfferController');
    }
    if (offer.authorId !== user.id) {
      throw new HttpError(StatusCodes.FORBIDDEN, 'Only author can edit offer', 'OfferController');
    }
    await this.offerRepository.deleteById(`${params.offerId}`);
    this.noContent(response);
  }

  public async getPremium(
    { params, query, user }: Request<Record<string, unknown>>,
    response: Response
  ): Promise<void> {
    const limit = query.limit ? parseInt(`${query.limit}`, 10) : 3;
    const offset = query.offset ? parseInt(`${query.offset}`, 10) : 0;

    const offers = await this.offerRepository.findPremiumByCity(`${params.city}`, limit, offset);
    if (offers) {
      await this._updateFavourite(offers, user?.id);
    }
    this.ok(response, offers);
  }

  private async _updateFavourite(offers: OfferDto[], userId?: string) {
    if (userId) {
      const favouriteIds = await this.userRepository.getFavourites(userId);
      offers.forEach((offer) => {
        if (offer && favouriteIds.includes(offer.id || '')) {
          offer.isPremium = true;
        }
      });
    }
  }
}
