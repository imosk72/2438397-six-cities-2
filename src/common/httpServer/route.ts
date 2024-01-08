import { NextFunction, Request, Response } from 'express';
import { HttpMethod } from './HTTP-method.js';
import { IMiddleware } from './middleware/middleware-interface.js';

export interface Route {
  path: string;
  method: HttpMethod;
  middlewares?: IMiddleware[];
  handler: (request: Request, response: Response, next: NextFunction) => void;
}
