import { NextFunction, Request, Response } from 'express';
import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { StatusCodes } from 'http-status-codes';
import {IMiddleware} from './IMiddleware.js';

export class ValidateDtoMiddleware implements IMiddleware {
  private readonly dto: ClassConstructor<object>;

  constructor(dto: ClassConstructor<object>) {
    this.dto = dto;
  }

  public async execute({ body }: Request, res: Response, next: NextFunction): Promise<void> {
    const dtoInstance = plainToInstance(this.dto, body);
    const errors = await validate(dtoInstance);

    if (errors.length > 0) {
      res.status(StatusCodes.BAD_REQUEST).send(errors);
      return;
    }
    next();
  }
}
