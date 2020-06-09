export class User {
  id: string;
  username: string;
  password: string;
  age: number;
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
  friend?: PartialUser;

  constructor(age: number, username: string) {
    this.age = age;
    this.username = username;
  }
}
