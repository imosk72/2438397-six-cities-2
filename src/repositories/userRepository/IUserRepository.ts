import { DocumentType } from '@typegoose/typegoose';
import { UserDto } from '../../models/user/userDto.js';
import { UserEntity } from '../../models/user/userEntity.js';

export interface IUserRepository {
  create(dto: UserDto): Promise<DocumentType<UserEntity>>;
  findById(id: string): Promise<DocumentType<UserEntity> | null>;
  findByEmail(email: string): Promise<DocumentType<UserEntity> | null>;
}
