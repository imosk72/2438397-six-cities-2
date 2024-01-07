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
import { UserDto } from '../../models/user/userDto.js';
import { IsDocumentExistsMiddleware } from '../../common/httpServer/middleware/isDocumentExists.js';
import { IOfferRepository } from '../../repositories/offerRepository/IOfferRepository.js';
import { ValidateDtoMiddleware } from '../../common/httpServer/middleware/validateDto.js';
import { ValidateObjectIdMiddleware } from '../../common/httpServer/middleware/validateObjectId.js';
import { UploadFileMiddleware } from '../../common/httpServer/middleware/uploadFile.js';
import { ConfigRegistry } from '../../common/config/configRegistry.js';
import { PrivateRouteMiddleware } from '../../common/httpServer/middleware/authentication.js';
import { CreateUserRequest, LoginUserRequest } from '../../models/user/userRequests.js';
import { createSHA256Hash } from '../../utils/hashing.js';
import { ITokenRepository } from '../../repositories/tokenRepository/ITokenRepository.js';
import { createJWT, JWT_ALGORITHM } from '../../utils/jwt.js';

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
    await this.userRepository.addToFavoriteOffer(request.user.id, request.params.offerId);
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
}
