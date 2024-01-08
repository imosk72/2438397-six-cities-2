import {UserType} from '../user/user-type.js';

export type CommentType = {
  text: string;
  publicationDate: Date;

  rating: number;
  author: UserType;
}
