export function getMongoConnectionUri(
  host: string, port: string, dbName: string, username: string, password: string,
): string {
  return `mongodb://${username}:${password}@${host}:${port}/${dbName}?authSource=admin`;
}
