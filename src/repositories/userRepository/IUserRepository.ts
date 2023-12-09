import { UserDto } from '../../models/user/userDto.js';

export interface IUserRepository {
  save(dto: UserDto): Promise<UserDto>;
  findById(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
}
