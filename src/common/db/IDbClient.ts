import {Mongoose} from 'mongoose';

export interface IDbClient {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
  getConnection(): Mongoose;
}
