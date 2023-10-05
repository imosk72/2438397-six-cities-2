import {User} from "./user";

export type Comment = {
  text: string;
  publicationDate: Date;

  rating: number;
  author: User;
}
