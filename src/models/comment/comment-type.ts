import {UserType} from '../user/user-type';

export type CommentType = {
  text: string;
  publicationDate: Date;

  rating: number;
  author: UserType;
}
