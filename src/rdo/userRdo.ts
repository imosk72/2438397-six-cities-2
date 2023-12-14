import { Expose } from 'class-transformer';

export class UserRdo {
  @Expose()
  public username!: string;

  @Expose()
  public email!: string;

  @Expose()
  public avatar!: string;
}

export class LoginUserRdo {
  @Expose()
  public token!: string;

  @Expose()
  public refreshToken!: string;

  @Expose()
  public email!: string;
}
