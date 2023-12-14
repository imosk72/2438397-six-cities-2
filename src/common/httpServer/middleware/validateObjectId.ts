import mongoose from 'mongoose';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IMiddleware } from './IMiddleware.js';
import { HttpError } from '../exceptions/httpError.js';

const { Types } = mongoose;

export class ValidateObjectIdMiddleware implements IMiddleware {
  private readonly param: string;

  constructor(param: string) {
    this.param = param;
  }

  public execute({ params }: Request, _res: Response, next: NextFunction): void {
    const objectId = params[this.param];

    if (Types.ObjectId.isValid(objectId)) {
      return next();
    }

    throw new HttpError(StatusCodes.BAD_REQUEST, `${objectId} is invalid ObjectID`, 'ValidateObjectIdMiddleware');
  }
}
