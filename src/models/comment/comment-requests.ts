import {
  IsDateString, IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateCommentRequest {
  @MinLength(5, {message: 'Min length for text is 10'})
  @MaxLength(1024, {message: 'Max length for text is 100'})
  public text!: string;


  @IsDateString({}, {message: 'date should be correct date string in ISO format'})
  public date!: string;

  @IsString({message: 'OfferId must be string'})
  public offerId!: string;

  @Min(1, {message: 'Min rating is 1'})
  @Max(5, {message: 'Max rating is 5'})
  public rating!: number;
}
