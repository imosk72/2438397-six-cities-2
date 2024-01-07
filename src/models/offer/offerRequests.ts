import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsString,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { City, Facilities, HousingType } from '../enums.js';

export class CreateCoordinatesRequest {
  @Min(-180, {message: 'Latitude must be at least -180'})
  @Max(180, {message: 'Latitude must be at most 180'})
  public latitude!: number;

  @Min(-90, {message: 'Longitude must be at least -90'})
  @Max(90, {message: 'Longitude must be at most 90'})
  public longitude!: number;
}

export class CreateOfferRequest {
  @MinLength(10, {message: 'Min length for title is 10'})
  @MaxLength(100, {message: 'Max length for title is 100'})
  public title!: string;

  @MinLength(20, {message: 'Min length for description is 20'})
  @MaxLength(1024, {message: 'Max length for description is 1024'})
  public description!: string;

  @IsDateString({}, {message: 'date should be correct date string in ISO format'})
  public date!: string;

  @IsEnum(City, {message: 'type must be one of the city'})
  public city!: City;

  @IsString({message: 'preview should be string'})
  public preview!: string;

  @IsArray({message: 'images must be an array'})
  @ArrayMinSize(6, {message: 'Images should contain exactly 6 photos'})
  @ArrayMaxSize(6, {message: 'Images should contain exactly 6 photos'})
  public images!: Array<string>;

  @IsBoolean({message: 'field isPremium must be boolean'})
  public isPremium!: boolean;

  @IsBoolean({message: 'field isFavourite must be boolean'})
  public isFavourite!: boolean;

  @Min(1, {message: 'Min rating is 1'})
  @Max(5, {message: 'Max rating is 5'})
  public rating!: number;

  @IsEnum(HousingType, {message: 'type must be one of the housing types'})
  public housingType!: HousingType;

  @Min(1, {message: 'Min count of rooms is 1'})
  @Max(8, {message: 'Max count of rooms is 8'})
  public roomCount!: number;

  @Min(1, {message: 'Min count of guests is 1'})
  @Max(10, {message: 'Max count of guests is 10'})
  public guestCount!: number;

  @Min(100, {message: 'Min cost is 100'})
  @Max(100000, {message: 'Max cost is 100000'})
  public cost!: number;

  @IsArray({message: 'field facilities must be an array'})
  @IsEnum(Facilities, {each: true, message: 'type must be one of the facilities'})
  @ArrayNotEmpty({message: 'There should be at least 1 facility'})
  public facilities!: Facilities[];

  @IsObject({message: 'There should be object CoordinatesType'})
  @ValidateNested()
  @Type(() => CreateCoordinatesRequest)
  public coordinates!: CreateCoordinatesRequest;
}
