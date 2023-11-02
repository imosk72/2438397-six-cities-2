import typegoose, { defaultClasses, Ref, Severity } from '@typegoose/typegoose';
import { City, Facilities, HousingType } from '../enums.js';
import { Coordinates } from './offerType.js';
import { UserEntity } from '../user/userEntity.js';

const { prop, modelOptions } = typegoose;

export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers',
  },
})
export class OfferEntity extends defaultClasses.TimeStamps {
  @prop({ required: true })
  public title!: string;

  @prop({ required: true })
  public description!: string;

  @prop({ required: true })
  public date!: Date;

  @prop({ required: true, enum: City })
  public city!: City;

  @prop({ required: true })
  public preview!: string;

  @prop({ required: true, type: String, default: [] })
  public images!: Array<string>;

  @prop({ required: true })
  public isPremium!: boolean;

  @prop({ required: true })
  public isFavourite!: boolean;

  @prop({ required: true })
  public rating!: number;

  @prop({ required: true, enum: HousingType })
  public housingType!: HousingType;

  @prop({ required: true })
  public roomCount!: number;

  @prop({ required: true })
  public guestCount!: number;

  @prop({ required: true })
  public cost!: number;

  @prop({ required: true, enum: Facilities, type: String, default: [] })
  public facilities!: Array<Facilities>;

  @prop({ required: true, ref: UserEntity })
  public author!: Ref<UserEntity>;

  @prop({ required: true })
  public commentsCount!: number;

  @prop({ required: true, allowMixed: Severity.ALLOW })
  public coordinates!: Coordinates;
}
