import { NextFunction, Request, Response } from 'express';
import { HttpMethod } from './httpMethod.js';
import { IMiddleware } from './middleware/IMiddleware.js';

export interface Route {
  path: string;
  method: HttpMethod;
  middlewares?: IMiddleware[];
  handler: (request: Request, response: Response, next: NextFunction) => void;
}
