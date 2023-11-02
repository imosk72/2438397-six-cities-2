export interface IDbClient {
  connect(uri: string): Promise<void>;
  disconnect(): Promise<void>;
}
