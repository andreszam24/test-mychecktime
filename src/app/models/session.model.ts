import { User } from './user.model';

export class Session {

  access_token: string;
  expires_in: number; //segundos
  account: User;
}
