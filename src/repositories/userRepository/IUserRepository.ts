import { UserDto } from '../../models/user/userDto';

export interface IUserRepository {
  save(dto: UserDto): Promise<UserDto>;
  findById(id: string): Promise<UserDto | null>;
  findByEmail(email: string): Promise<UserDto | null>;
}
