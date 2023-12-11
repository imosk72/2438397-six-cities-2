import { NextFunction, Request, Response } from 'express';

export interface IExceptionFilter {
  catch(error: Error, request: Request, response: Response, next: NextFunction): void;
}
