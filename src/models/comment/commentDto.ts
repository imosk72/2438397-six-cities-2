import { Expose } from 'class-transformer';

export class CommentDto {
  @Expose()
  public id?: string;

  @Expose()
  public text!: string;

  @Expose()
  public date!: string;

  @Expose()
  public offerId!: string;

  @Expose()
  public rating!: number;

  @Expose()
  public userId!: string;
}
