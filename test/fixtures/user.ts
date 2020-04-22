export class User {
  id: string;
  username: string;
  password: string;
  age: number;
  email: string;
  birthDay: Date;
  monthsAlive?: number;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}
