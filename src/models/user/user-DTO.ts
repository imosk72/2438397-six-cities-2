import {Expose} from 'class-transformer';
import {UserLevel} from '../enums.js';

export class UserDto {
  @Expose()
  public id?: string;

  @Expose()
  public email!: string;

  @Expose()
  public type!: UserLevel;

  @Expose()
  public username!: string;

  @Expose()
  public avatar?: string;
}

