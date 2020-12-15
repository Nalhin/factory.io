import { User } from './user';

export class Post {
  likedBy: User[];
  author: User;

  constructor(likedBy: User[], author: User) {
    this.likedBy = likedBy;
    this.author = author;
  }
}
