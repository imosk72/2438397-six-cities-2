import { Schema } from 'mongoose';

export const CommentModelSchema = new Schema(
  {
    text: String,
    offerId: {
      type: Schema.Types.ObjectId,
      ref: 'Offer',
    },
    rating: Number,
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  }
);
