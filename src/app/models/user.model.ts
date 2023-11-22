import { Rol } from './rol.model';

export class User {
  id: number;
  email: string;
  status: string;
  name: string;
  lastname: string;
  lastnameS: string;
  gender: string;
  phone: string;

  roles: Array<Rol>;
}
