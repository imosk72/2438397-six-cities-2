import {User} from './user.js';

export type Comment = {
  text: string;
  publicationDate: Date;

  rating: number;
  author: User;
}
