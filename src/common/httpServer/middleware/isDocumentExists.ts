import { StatusCodes } from 'http-status-codes';
import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from './IMiddleware.js';
import { IEntityExistsRepository } from '../../repository/IEntityExistsRepository.js';
import { HttpError } from '../exceptions/httpError.js';

export class IsDocumentExistsMiddleware implements IMiddleware {
  private readonly repository: IEntityExistsRepository;
  private readonly entityName: string;
  private readonly paramName: string;

  constructor(
    repository: IEntityExistsRepository, entityName: string, paramName: string,
  ) {
    this.repository = repository;
    this.entityName = entityName;
    this.paramName = paramName;
  }

  public async execute({ params }: Request, _response: Response, next: NextFunction): Promise<void> {
    const documentId = params[this.paramName];
    if (!(await this.repository.exists(documentId))) {
      throw new HttpError(StatusCodes.NOT_FOUND, `${this.entityName} with ${documentId} not found.`, 'DocumentExists');
    }

    next();
  }
}
