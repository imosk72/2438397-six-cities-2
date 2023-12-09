import {UserType} from '../user/userType.js';

export type CommentType = {
  text: string;
  publicationDate: Date;

  rating: number;
  author: UserType;
}
