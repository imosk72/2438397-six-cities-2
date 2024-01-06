import {UserLevel} from '../enums.js';
import {Schema} from 'mongoose';

export const UserModelSchema = new Schema(
  {
    username: String,
    email: String,
    avatar: String,
    password: String,
    type: {
      type: String,
      enum : UserLevel,
      default: UserLevel.STANDART
    },
    createdAt: Date,
    updatedAt: Date,
    favourite: [String],
  }
);
