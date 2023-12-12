import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from './httpError.js';
import { IExceptionFilter } from './IExceptionFilter.js';
import { ILogger } from '../../logging/ILogger.js';
import { AppTypes } from '../../../application/appTypes.js';

@injectable()
export class ExceptionFilter implements IExceptionFilter {
  private readonly logger: ILogger;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger) {
    this.logger = logger;
  }

  private handleHttpError(error: HttpError, response: Response) {
    this.logger.warn(`[${error.detail}]: ${error.statusCode} — ${error.message}`);
    response.status(error.statusCode).json({ error: error.message });
  }

  private handleCommonError(error: Error, response: Response) {
    this.logger.warn(error.message);
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }

  public catch(error: Error | HttpError, _request: Request, response: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, response);
    }

    this.handleCommonError(error, response);
  }
}
