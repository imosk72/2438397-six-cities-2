import { inject, injectable } from 'inversify';
import mongoose, { Mongoose } from 'mongoose';
import { setTimeout } from 'node:timers/promises';
import { IDbClient } from './db-client-interface.js';
import { AppTypes } from '../../application/app-types.js';
import { ILogger } from '../logging/logger-interface.js';

const RETRY_ATTEMPTS = 10;
const RETRY_TIMEOUT = 5000;

@injectable()
export class MongoClient implements IDbClient {
  private isConnected = false;
  private mongooseInstance?: Mongoose = undefined;

  private readonly logger: ILogger;

  constructor(@inject(AppTypes.LoggerInterface) logger: ILogger) {
    this.logger = logger;
  }

  private async _connectWithRetry(uri: string): Promise<Mongoose> {
    let attempt = 0;
    while (attempt < RETRY_ATTEMPTS) {
      try {
        return await mongoose.connect(uri);
      } catch (error) {
        attempt++;
        this.logger.error(`Failed to connect to the database. Attempt ${attempt}`);
        await setTimeout(RETRY_TIMEOUT);
      }
    }
    this.logger.error(`Unable to establish database connection after ${attempt}`);
    throw new Error('Failed to connect to the database');
  }

  public async connect(uri: string): Promise<void> {
    if (this.isConnected) {
      this.logger.warn('Already connected to database');
      return;
    }

    this.logger.info('Trying to connect to database...');

    this.mongooseInstance = await this._connectWithRetry(uri);
    this.isConnected = true;

    this.logger.info('Database connection established.');
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      this.logger.warn('Not connected to database');
      return;
    }

    this.logger.info('Closing database connection...');

    await this.mongooseInstance?.disconnect();
    this.isConnected = false;
    this.mongooseInstance = undefined;

    this.logger.info('Database connection closed.');
  }

  public getConnection() : Mongoose {
    if (!this.isConnected) {
      this.logger.error('Attempt to get not established connection');
      throw new Error();
    }
    return this.mongooseInstance!;
  }
}
