import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLAuthLogin, optionsCredentials } from '../resources/urls.resource';
import { User } from '../models/user.model';



@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private http: HttpClient) { }

  async login(email: string, password: string): Promise<User | null> {
    const user = { email, password };
  
    try {
      const response: any = await this.http.post(URLAuthLogin, user, optionsCredentials).toPromise();
  
      if (response) {
        if (response.status === 200) {
          return response;
        } else if (response.status === 401) {
          return null;
        } else {
          throw new Error(response.status.toString());
        }
      } else {
        throw new Error('Respuesta nula en la solicitud');
      }
    } catch (error) {
      console.error('Error en la solicitud: ', error);
      return null; 
    }
  }
 
}