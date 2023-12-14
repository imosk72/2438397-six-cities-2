import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';
import { createSecretKey } from 'node:crypto';
import { IMiddleware } from './IMiddleware.js';
import { HttpError } from '../exceptions/httpError.js';

export const BLACK_LIST_TOKENS: Set<string> = new Set();

export class AuthenticateMiddleware implements IMiddleware {
  private readonly jwtSecret: string;

  constructor(jwtSecret: string) {
    this.jwtSecret = jwtSecret;
  }

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const authorizationHeader = request.headers?.authorization?.split(' ');
    if (!authorizationHeader) {
      return next();
    }

    const [, token] = authorizationHeader;

    try {
      const { payload } = await jwtVerify(token, createSecretKey(this.jwtSecret, 'utf-8'), {
        algorithms: ['HS256'],
      });

      if (BLACK_LIST_TOKENS.has(token)) {
        return next(new HttpError(StatusCodes.UNAUTHORIZED, 'Token in black list', 'AuthenticateMiddleware'));
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
