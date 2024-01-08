import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { plainToInstance } from 'class-transformer';

import { RestController } from '../../common/httpServer/controller/rest-controller';
import { AppTypes } from '../../application/app-types';
import { HttpMethod } from '../../common/httpServer/HTTP-method';
import { ILogger } from '../../common/logging/logger-interface';
import { HttpError } from '../../common/httpServer/exceptions/HTTP-error';
import { IUserRepository } from '../../repositories/user-repository/user-repository-interface';
import { UserDto } from '../../models/user/user-DTO';
import { IsDocumentExistsMiddleware } from '../../common/httpServer/middleware/is-document-exists';
import { IOfferRepository } from '../../repositories/offer-repository/offer-repository-interface';
import { ValidateDtoMiddleware } from '../../common/httpServer/middleware/validate-DTO';
import { ValidateObjectIdMiddleware } from '../../common/httpServer/middleware/validate-object-id';
import { UploadFileMiddleware } from '../../common/httpServer/middleware/upload-file';
import { ConfigRegistry } from '../../common/config/config-registry';
import { PrivateRouteMiddleware } from '../../common/httpServer/middleware/authentication.js';
import { CreateUserRequest, LoginUserRequest } from '../../models/user/user-requests';
import { createSHA256Hash } from '../../utils/hashing.js';
import { ITokenRepository } from '../../repositories/token-repository/token-repository-interface';
import { createJWT, JWT_ALGORITHM } from '../../utils/JWT';

@injectable()
export class UserController extends RestController {
  private readonly config: ConfigRegistry;
  private readonly userRepository: IUserRepository;
  private readonly offerRepository: IOfferRepository;
  private readonly tokenRepository: ITokenRepository;

  constructor (
    @inject(AppTypes.LoggerInterface) logger: ILogger,
    @inject(AppTypes.UserRepository) userRepository: IUserRepository,
    @inject(AppTypes.OfferRepository) offerRepository: IOfferRepository,
    @inject(AppTypes.TokenRepository) tokenRepository: ITokenRepository,
    @inject(AppTypes.ConfigRegistry) config: ConfigRegistry,
  ) {
    super(logger);
    this.config = config;
    this.userRepository = userRepository;
    this.offerRepository = offerRepository;
    this.tokenRepository = tokenRepository;

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.register,
      middlewares: [new ValidateDtoMiddleware(CreateUserRequest)],
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserRequest)],
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Post,
      handler: this.logout,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/favourite/:offerId',
      method: HttpMethod.Post,
      handler: this.addFavourite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'offerId'),
      ],
    });
    this.addRoute({
      path: '/favourite/:offerId',
      method: HttpMethod.Delete,
      handler: this.deleteFavourite,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('offerId'),
        new IsDocumentExistsMiddleware(this.offerRepository, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/favourite',
      method: HttpMethod.Get,
      handler: this.getFavourite,
      middlewares: [new PrivateRouteMiddleware()],
    });
    this.addRoute({
      path: '/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new PrivateRouteMiddleware(),
        new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'), 'avatar'),
      ],
    });
    this.addRoute({
      path: '/me',
      method: HttpMethod.Get,
      handler: this.getUserInfo,
      middlewares: [
        new PrivateRouteMiddleware(),
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
    { body }: Request<Record<string, unknown>, Record<string, unknown>, LoginUserRequest>, response: Response,
  ): Promise<void> {
    const user = await this.userRepository.findByEmail(body.email);

    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, `User with email ${body.email} not found.`, 'UserController');
    }

    if (
      await this.userRepository.getHashedPassword(user.id || '') !== createSHA256Hash(body.password, this.config?.get('SALT'))
    ) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Wrong password', 'UserController');
    }
    const token = await createJWT(
      JWT_ALGORITHM,
      this.config.get('JWT_SECRET'),
      {
        email: user.email,
        id: user.id,
        date: new Date(),
      }
    );
    await this.tokenRepository.save({token: token, userId: user.id || ''});
    response.set('authorization', [token]);
    this.noContent(response);
  }

  public async logout(request: Request, response: Response): Promise<void> {
    const [token] = request.headers.authorization?.split(' ') || '';
    await this.tokenRepository.remove(token);

    if (!request.user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'UserController');
    }

    this.noContent(response);
  }

  public async getFavourite(request: Request, response: Response): Promise<void> {
    const offerIds = await this.userRepository.getFavourites(request.user.id);
    let offers = await Promise.all(offerIds.map(
      async (offerId) => await this.offerRepository.findById(offerId)
    ));
    offers = offers.filter((offer) => offer !== null);
    offers.forEach((offer) => {
      if (offer) {
        offer.isFavourite = true;
      }
    });
    this.ok(response, offers);
  }

  public async addFavourite(request: Request, response: Response): Promise<void> {
    const favouriteOffers = await this.userRepository.getFavourites(request.user.id);
    if (!favouriteOffers.includes(request.params.offerId)) {
      await this.userRepository.addToFavoriteOffer(request.user.id, request.params.offerId);
    }
    this.noContent(response);
  }

  public async deleteFavourite(request: Request, response: Response): Promise<void> {
    await this.userRepository.removeFavouriteOffer(request.user.id, request.params.offerId);
    this.noContent(response);
  }

  public async uploadAvatar(request: Request, response: Response) {
    await this.userRepository.updateAvatar(request.user.id, `${request.file?.filename}`);
    this.created(response, {
      filepath: request.file?.path,
    });
  }

  public async getUserInfo(request: Request, response: Response) {
    const user = await this.userRepository.findById(request.user.id);
    return this.ok(response, user);
  }
}