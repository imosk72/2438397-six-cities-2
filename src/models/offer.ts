import {City, Facilities, HousingType} from './enums.js';
import {User} from './user.js';

export type Coordinates = {
  latitude: number,
  longitude: number
}

export type Offer = {
  title: string;
  description: string;
  date: Date;
  city: City;
  preview: string;
  images: Array<string>;
  isPremium: boolean;
  isFavourite: boolean;
  rating: number;
  housingType: HousingType;
  roomCount: number;
  guestCount: number;
  cost: number;
  facilities: Array<Facilities>;
  author: User;
  commentsCount: number;
  coordinates: Coordinates;
}
