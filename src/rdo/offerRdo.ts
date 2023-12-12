import { Expose } from 'class-transformer';
import { City, Facilities, HousingType } from '../models/enums.js';
import { UserType } from '../models/user/userType.js';
import { Coordinates } from '../models/offer/offerType.js';

export class FullOfferRdo {
  @Expose()
    name!: string;

  @Expose()
    description!: string;

  @Expose()
    publicationDate!: Date;

  @Expose()
    city!: City;

  @Expose()
    previewImage!: string;

  @Expose()
    images!: string[];

  @Expose()
    premium!: boolean;

  @Expose()
    favorite = true;

  @Expose()
    rating!: number;

  @Expose()
    housingType!: HousingType;

  @Expose()
    roomCount!: number;

  @Expose()
    guestCount!: number;

  @Expose()
    cost!: number;

  @Expose()
    facilities!: Facilities[];

  @Expose()
    offerAuthor!: UserType;

  @Expose()
    commentsCount!: number;

  @Expose()
    coordinates!: Coordinates;
}

export class OfferRdo {
  @Expose()
    name!: string;

  @Expose()
    publicationDate!: Date;

  @Expose()
    city!: City;

  @Expose()
    previewImage!: string;

  @Expose()
    premium!: boolean;

  @Expose()
    favorite!: boolean;

  @Expose()
    rating!: number;

  @Expose()
    housingType!: HousingType;

  @Expose()
    cost!: number;

  @Expose()
    commentsCount!: number;
}
