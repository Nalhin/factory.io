export class User {
  id: string;
  username: string;
  password: string;
  age: number;
  email: string;
  birthDay: Date;
  monthsAlive?: number;
  friend?: PartialUser;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}

export class PartialUser {
  id?: string;
  username: string;
  age: number;
  birthDay: Date;
  friend?: PartialUser;
}
