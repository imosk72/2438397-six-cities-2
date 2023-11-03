import {UserLevel} from "../enums";
import {Schema} from "mongoose";

export const UserModelSchema = new Schema(
  {
    name: String,
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
  }
)