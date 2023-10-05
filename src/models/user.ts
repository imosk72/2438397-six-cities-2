import {UserType} from "./enums";

export type User = {
  name: string;
  email: string;
  avatar?: string;
  password: string;
  type: UserType;
}
