import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';
import { createSecretKey } from 'node:crypto';
import { IMiddleware } from './middleware-interface';
import { HttpError } from '../exceptions/HTTP-error';
import { JWT_ALGORITHM } from '../../../utils/JWT';
import { ITokenRepository } from '../../../repositories/token-repository/token-repository-interface';

export class AuthenticateMiddleware implements IMiddleware {
  private readonly jwtSecret: string;
  private readonly tokenRepository: ITokenRepository;

  constructor(
    jwtSecret: string,
    tokenRepository: ITokenRepository,
  ) {
    this.jwtSecret = jwtSecret;
    this.tokenRepository = tokenRepository;
  }

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [token] = authorizationHeader;
    try {
      const { payload } = await jwtVerify(token, createSecretKey(this.jwtSecret, 'utf-8'), {
        algorithms: [JWT_ALGORITHM],
      });
      if (await this.tokenRepository.getUserId(token) === null) {
        return next(new HttpError(StatusCodes.UNAUTHORIZED, 'Token revoked', 'AuthenticateMiddleware'));
      }
      request.user = { email: payload.email as string, id: payload.id as string };
      return next();
    } catch {
      return next(new HttpError(StatusCodes.UNAUTHORIZED, 'Invalid token', 'AuthenticateMiddleware'));
    }
  }
}

export class PrivateRouteMiddleware implements IMiddleware {
  public async execute({ user }: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'Unauthorized', 'PrivateRouteMiddleware');
    }

    return next();
  }
}
