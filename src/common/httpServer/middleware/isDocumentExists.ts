import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './IMiddleware.js';
import { IEntityExistsRepository } from '../../repository/IEntityExistsRepository.js';
import { HttpError } from '../exceptions/httpError.js';

export class IsDocumentExistsMiddleware implements IMiddleware {
  private readonly service: IEntityExistsRepository;
  private readonly entityName: string;
  private readonly paramName: string;

  constructor(
    service: IEntityExistsRepository, entityName: string, paramName: string,
  ) {
    this.service = service;
    this.entityName = entityName;
    this.paramName = paramName;
  }

  public async execute({ params }: Request, _response: Response, next: NextFunction): Promise<void> {
    const documentId = params[this.paramName];
    if (!(await this.service.exists(documentId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `${this.entityName} with ${documentId} not found.`, 'DocumentExists');
    }

    next();
  }
}
