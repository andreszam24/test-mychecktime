import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from, of ,merge} from 'rxjs';
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
    let redirectFlag = false;
  
    this.user = platformObs.pipe(
      switchMap(() => {
        const localStorageObs = from(this.storage.get(TOKEN_KEY)); 
        console.log(localStorageObs)

        const sessionStorageObs = from(new Observable<string>((observer) => {
          const token = sessionStorage.getItem(TOKEN_KEY);
          observer.next(token!);
          observer.complete();
        }));

        return localStorageObs ? localStorageObs : sessionStorageObs;
      }),
      map((token) => {
        if (token) {
          console.log('Token almacenado:', token); 
          let decoded = helper.decodeToken(token);
          this.userData.next(decoded);
          if (!redirectFlag && localStorage.getItem(TOKEN_KEY) !== null) {
            redirectFlag = true;
            this.router.navigateByUrl('/home');
          }
          return true;
        } else {
          console.log('No se encontró token almacenado.');
          return null;
        }
      })
    );
  }

  login(email: string, password: string, rememberMe: boolean) {
  
    const user = { email, password };
    console.log(email, password, rememberMe)
  
    return this.http
      .post(URLAuthLogin, user, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.log('usuario no autorizado:', response.status);
            return of(null);
          }
        }),
        switchMap((token) => {
          let decoded = helper.decodeToken(token.access_token);
          this.userData.next(decoded);

          let storageObs: Observable<any>;
          if (rememberMe) {
            storageObs = from(this.storage.set(TOKEN_KEY, token.access_token));
            localStorage.setItem(TOKEN_KEY, token.access_token);
          } else {
            storageObs = new Observable<string>((observer) => {
              sessionStorage.setItem(TOKEN_KEY, token.access_token);
              const storedToken = sessionStorage.getItem(TOKEN_KEY);
              observer.next(storedToken!);
              observer.complete();
            });
          }
          return storageObs;
        })
      );
  }

  getAuthToken(): string | null {
    return localStorage.getItem('jwt-token'); 
  }

  checkAuthentication(): Observable<boolean> {
    const token = this.getAuthToken();
    return of(!!token); 
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
}



