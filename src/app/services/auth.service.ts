import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { URLAuthLogin, headers } from '../resources/urls.resource';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';


const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  public user: Observable<any>;
  private userData = new BehaviorSubject(null);

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private plt: Platform,
    private router: Router
  ) {
    this.storage.create().then(() => {
      this.loadStoredToken();
    });
  }

  loadStoredToken() {
    let platformObs = from(this.plt.ready());

    this.user = platformObs.pipe(
      switchMap(() => {
        return from(this.storage.get(TOKEN_KEY));
      }),
      map((token) => {
        if (token) {
          let decoded = helper.decodeToken(token);
          this.userData.next(decoded);
          return true;
        } else {
          return null;
        }
      })
    );
  }

  login(email: string, password: string) {

    const user = { email, password };

    return this.http
      .post(URLAuthLogin, user, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            console.log(response.body)
            return response.body;
          } else {
            console.log('usuario no autorizado:', response.status);
            return of(null);
          }
        }),
        switchMap((token) => {
          let decoded = helper.decodeToken(token.access_token);
          this.userData.next(
            decoded,
          );
          let storageObs = from(this.storage.set(TOKEN_KEY, token.access_token));
          return storageObs;
        })
      );
  }

  getUser() {
    return this.userData.getValue();
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next(null);
    });
  }

  static getToken(): string {
    return localStorage.getItem(TOKEN_KEY) ?? 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vbXljaGVja3RpbWUuY29tLmNvL21haW4vbG9naW4iLCJpYXQiOjE3MDAxNzQyODQsImV4cCI6MTcwMTM4Mzg4NCwibmJmIjoxNzAwMTc0Mjg0LCJqdGkiOiJvakJ3dUdJaGlrMGM2MmY3Iiwic3ViIjoxLCJwcnYiOiJiNmY3ZjQ3YWNiZjFhNWVlMTFiMmIwMjhkYzU2YWEzNWYyMGMxYTdlIn0.iygOihr2kO7u8dW3UnVdzqpA4qF_LcVLdgA4AFBAQ5s';
  }
  
  static getTokenParams(): string {
    return '?token=' + AuthService.getToken();
  }


}



