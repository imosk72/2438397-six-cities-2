import { Expose, Type } from 'class-transformer';
import { City, Facilities, HousingType } from '../enums.js';

export class CoordinatesDto {
  @Expose()
  public latitude!: number;

  @Expose()
  public longitude!: number;
}

export class OfferDto {
  @Expose()
  public id?: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;

  @Expose()
  public date!: Date;

  @Expose()
  public city!: City;

  @Expose()
  public preview!: string;

  @Expose()
  public images!: Array<string>;

  @Expose()
  public isPremium!: boolean;

  @Expose()
  public isFavourite!: boolean;

  @Expose()
  public rating!: number;

  @Expose()
  public housingType!: HousingType;

  @Expose()
  public roomCount!: number;

  @Expose()
  public guestCount!: number;

  @Expose()
  public cost!: number;

  @Expose()
  public facilities!: Array<Facilities>;

  @Expose()
  public authorId!: string;

  @Expose()
  public commentsCount!: number;

  @Expose()
  @Type(() => CoordinatesDto)
  public coordinates!: CoordinatesDto;

  @Expose()
  public commentsTotalRating!: number;
}
