import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from, of, defer} from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, switchMap, catchError } from 'rxjs/operators';
import { URLAuthLogin, headers, URLAuthRefresh, httpOptions } from '../resources/urls.resource';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';

const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  public user: Observable<{ loggedIn: boolean; token: string | null }>;
  private userData = new BehaviorSubject<{ loggedIn: boolean; token: any }>({ loggedIn: false, token: null });
  private redirectFlag = false;

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
    //console.log('entro a loadStoredToken');
    let platformObs = from(this.plt.ready());
    this.user = platformObs.pipe(
      map(() => this.handleStoredToken(AuthService.getAuthToken()))
    );
  }
  
  handleStoredToken(token: string | null): { loggedIn: boolean; token: any } {
    console.log('Token almacenado handleStoredToken:', token);
  
    if (token) {
      let decoded = helper.decodeToken(token);
      this.userData.next({ loggedIn: true, token: decoded });
      if (!this.redirectFlag && token === localStorage.getItem(TOKEN_KEY)) {
        this.redirectFlag = true;
        this.router.navigateByUrl('/home');
      }
      return { loggedIn: true, token: decoded };
    } else {
      console.log('No se encontró token almacenado.');
      return { loggedIn: false, token: null };
    }
  }

  handleLoginResponse(token: any, rememberMe: boolean): Observable<any> {
    //console.log('handleLoginResponse');
    let decoded = helper.decodeToken(token.access_token);
    this.userData.next({ loggedIn: true, token: decoded });
  
    let storageObs: Observable<any>;
  
    if (rememberMe) {
      storageObs = from(this.storage.set(TOKEN_KEY, token.access_token));
      localStorage.setItem(TOKEN_KEY, token.access_token);
    } else {
      storageObs = defer(() => {
        sessionStorage.setItem(TOKEN_KEY, token.access_token);
        return of(token.access_token);
      });
    }
  
    return storageObs.pipe(map((storedToken) => this.handleStoredToken(storedToken)));
  }
  
  login(email: string, password: string, rememberMe: boolean) {
    const userCredential = { email, password };
    console.log('userCredential:',userCredential)
    return this.http
      .post(URLAuthLogin, userCredential, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            //console.log(response.status)
            return response.body;
          } else {
            //console.log(response.status)
            return of(null);
          }
        }),
        switchMap((token) => this.handleLoginResponse(token, rememberMe)),
      );
  }

  
  static getAuthToken(): string | null {
    const localStorageToken = localStorage.getItem('jwt-token');
    const sessionStorageToken = sessionStorage.getItem('jwt-token');
    return localStorageToken ?? sessionStorageToken ?? null;
  }

  checkAuthentication(): Observable<boolean> {
    const token = AuthService.getAuthToken();
    return of(!!token); 
  }

  getUser() {
    return this.userData.asObservable();
  }

  logout() {
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/');
      this.userData.next({ loggedIn: false, token: null });
    });
  }

  static getTokenParams(): string {
    return '?token=' + AuthService.getAuthToken();
  }

  refreshToken(): Observable<string> {
    return this.http.post(URLAuthRefresh + AuthService.getTokenParams(), {}, httpOptions).pipe(
      map((response: any) => response)
    );
  }
}
