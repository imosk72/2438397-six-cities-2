import { City, Facilities, HousingType } from '../enums.js';
import { UserType } from '../user/userType.js';
import { Coordinates } from './offerType.js';

export class OfferDto {
  public title!: string;
  public description!: string;
  public date!: Date;
  public city!: City;
  public preview!: string;
  public images!: Array<string>;
  public isPremium!: boolean;
  public isFavourite!: boolean;
  public rating!: number;
  public housingType!: HousingType;
  public roomCount!: number;
  public guestCount!: number;
  public cost!: number;
  public facilities!: Array<Facilities>;
  public author!: UserType;
  public commentsCount!: number;
  public coordinates!: Coordinates;
}
