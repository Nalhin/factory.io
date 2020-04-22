import { User } from './user';

export class Post {
  id: number;
  title: string;
  description: string;
  likedBy: User[];
  author: User;
  created: Date;
}
