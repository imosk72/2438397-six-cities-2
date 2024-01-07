import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { UserLevel } from '../enums.js';

export class CreateUserRequest {
  @IsEmail({}, {message: 'Email must be valid.'})
  @IsString({message: 'Email is required.'})
  public email!: string;

  @Length(1, 15, {message: 'Username length should be from 1 to 15.'})
  @IsString({message: 'Username is required.'})
  public username!: string;

  @IsEnum(UserLevel, {message: 'type must be one of the user type'})
  public type!: UserLevel;

  @Length(6, 12, {message: 'Password length should be from 6 to 12.'})
  @IsString({message: 'Password is required.'})
  public password!: string;

  public avatar?: string;
}

export class LoginUserRequest {
  @IsEmail({}, {message: 'Email must be valid.'})
  @IsString({message: 'Email is required.'})
  public email!: string;

  @Length(6, 12, {message: 'Password length should be from 6 to 12.'})
  @IsString({message: 'Password is required.'})
  public password!: string;
}
