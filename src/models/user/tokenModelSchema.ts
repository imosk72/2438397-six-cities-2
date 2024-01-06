import {Schema} from 'mongoose';

export const TokenModelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    token: String,
  }
);
