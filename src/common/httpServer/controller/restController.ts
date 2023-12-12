import {inject, injectable} from 'inversify';
import { StatusCodes } from 'http-status-codes';
import { Response, Router } from 'express';
import { IController } from './IController.js';
import { Route } from '../route.js';
import { ILogger } from '../../logging/ILogger.js';
import { AppTypes } from '../../../application/appTypes.js';

const DEFAULT_CONTENT_TYPE = 'application/json';

@injectable()
export abstract class RestController implements IController {
  public readonly router: Router;
  private readonly logger: ILogger;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger) {
    this.logger = logger;
    this.router = Router();
  }

  public addRoute(route: Route) {
    this.router[route.method](route.path, route.handler.bind(this));
    this.logger.info(`Route registered: ${route.method.toUpperCase()} ${route.path}`);
  }

  public send<T>(response: Response, statusCode: number, data: T): void {
    response.type(DEFAULT_CONTENT_TYPE).status(statusCode).json(data);
  }

  public ok<T>(response: Response, data: T): void {
    this.send(response, StatusCodes.OK, data);
  }

  public created<T>(response: Response, data: T): void {
    this.send(response, StatusCodes.CREATED, data);
  }

  public noContent<T>(response: Response, data: T): void {
    this.send(response, StatusCodes.NO_CONTENT, data);
  }
}
