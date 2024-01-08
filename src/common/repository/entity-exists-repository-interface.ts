export interface IEntityExistsRepository {
  exists(id: string): Promise<boolean>;
}
