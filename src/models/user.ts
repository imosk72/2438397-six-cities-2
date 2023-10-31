import {UserType} from './enums.js';

export type User = {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserType;
}
