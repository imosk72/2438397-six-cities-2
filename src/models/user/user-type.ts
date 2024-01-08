import {UserLevel} from '../enums.js';

export type UserType = {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserLevel;
}
