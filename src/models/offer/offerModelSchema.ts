import { City, Facilities, HousingType } from '../enums.js';
import { Schema } from 'mongoose';

export const CoordinatesSchema = new Schema(
  {
    latitude: Number,
    longitude: Number,
  }
);

export const OfferModelSchema = new Schema(
  {
    title: String,
    description: String,
    date: Date,
    city: {
      type: String,
      enum: City,
    },
    preview: String,
    images: [String],
    isPremium: Boolean,
    isFavourite: Boolean,
    rating: Number,
    housingType: {
      type: String,
      enum: HousingType,
    },
    roomCount: Number,
    guestCount: Number,
    cost: Number,
    facilities: [{type: String, enum: Facilities}],
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    commentsCount: Number,
    coordinates: CoordinatesSchema,
    createdAt: Date,
    updatedAt: Date,
  }
);
