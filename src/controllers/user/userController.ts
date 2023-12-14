import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { plainToInstance } from 'class-transformer';

import { RestController } from '../../common/httpServer/controller/restController.js';
import { AppTypes } from '../../application/appTypes.js';
import { HttpMethod } from '../../common/httpServer/httpMethod.js';
import { ILogger } from '../../common/logging/ILogger.js';
import { HttpError } from '../../common/httpServer/exceptions/httpError.js';
import { IUserRepository } from '../../repositories/userRepository/IUserRepository.js';
import { UserDto, LoginUserDto } from '../../models/user/userDto.js';
import { OfferDto } from '../../models/offer/offerDto.js';
import {IsDocumentExistsMiddleware} from '../../common/httpServer/middleware/isDocumentExists.js';
import {IOfferRepository} from '../../repositories/offerRepository/IOfferRepository.js';
import {ValidateDtoMiddleware} from '../../common/httpServer/middleware/validateDto.js';
import {ValidateObjectIdMiddleware} from '../../common/httpServer/middleware/validateObjectId.js';
import {UploadFileMiddleware} from '../../common/httpServer/middleware/uploadFile.js';
import {ConfigRegistry} from '../../common/config/configRegistry.js';

@injectable()
export class UserController extends RestController {
  private readonly config: ConfigRegistry;
  private readonly userRepository: IUserRepository;
  private readonly offerRepository: IOfferRepository;

  constructor (
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.UserRepository) userRepository: IUserRepository,
    @inject(AppTypes.UserRepository) offerRepository: IOfferRepository,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
  ) {
    super(logger);
    this.config = config;
    this.userRepository = userRepository;
    this.offerRepository = offerRepository;

    this.addRoute({
      path: '/register',
      method: HttpMethod.Get,
      handler: this.register,
      middlewares: [new ValidateDtoMiddleware(UserDto)]
    });
    this.addRoute({path: '/login', method: HttpMethod.Post, handler: this.login});
    this.addRoute({path: '/logout', method: HttpMethod.Post, handler: this.logout});
    this.addRoute({
      path: '/favorite/:offerId',
      method: HttpMethod.Post,
      handler: this.addFavorite,
      middlewares: [new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'id'),]
    });
    this.addRoute({path: '/favorite/:offerId', method: HttpMethod.Delete, handler: this.deleteFavorite});
    this.addRoute({path: '/favorite', method: HttpMethod.Get, handler: this.getFavorite});
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'), 'avatar'),
      ],
    });
  }

  public async register(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, UserDto>, response: Response,
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(body.email);

    if (user) {
      throw new HttpError(StatusCodes.BAD_REQUEST, `User with email ${body.email} already exists.`, 'UserController');
    }

    const result = await this.userRepository.save(body);
    this.created(response, plainToInstance(UserDto, result, { excludeExtraneousValues: true }));
  }

  public async login(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, LoginUserDto>, _response: Response,
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(body.email);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, `User with email ${body.email} not found.`, 'UserController');
    }

    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Not implemented', 'UserController');
  }

  public async logout(_request: Request, _response: Response): Promise<void> {
    throw new HttpError(StatusCodes.NOT_IMPLEMENTED, 'Not implemented', 'UserController');
  }

  public async getFavorite(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, { userId: string }>, response: Response,
  ): Promise<void> {
    const result = await this.userRepository.getFavourites(body.userId);
    this.ok(response, plainToInstance(OfferDto, result, { excludeExtraneousValues: true }));
  }

  public async addFavorite(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, { offerId: string; userId: string }>,
    res: Response,
  ): Promise<void> {
    await this.userRepository.addToFavoriteOffer(body.offerId, body.userId);
    this.noContent(res, { message: 'Offer added to favourites' });
  }

  public async deleteFavorite(
    { body }: Request<Record<string, unknown>, Record<string, unknown>, { offerId: string; userId: string }>,
    res: Response,
  ): Promise<void> {
    await this.userRepository.removeFavouriteOffer(body.offerId, body.userId);
    this.noContent(res, { message: 'Offer removed from favourites' });
  }

  public async uploadAvatar(request: Request, response: Response) {
    this.created(response, {
      filepath: request.file?.path,
    });
  }
}
