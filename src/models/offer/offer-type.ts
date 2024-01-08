import {City, Facilities, HousingType} from '../enums.js';
import {UserType} from '../user/user-type';

export type Coordinates = {
  latitude: number,
  longitude: number
}

export type OfferType = {
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
  author: UserType;
  commentsCount: number;
  coordinates: Coordinates;
}
