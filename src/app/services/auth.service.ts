import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, from, of, defer } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { URLAuthLogin, headers, httpOptions } from '../resources/urls.resource';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

const helper = new JwtHelperService();
const TOKEN_KEY = 'jwt-token';
const USER_KEY = 'user-data';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  public user: Observable<{ loggedIn: boolean; account: any | null }>;
  private userData = new BehaviorSubject<{loggedIn: boolean; account: any;}>({ loggedIn: false, account: null });
  private redirectFlag = false;
  private userCredential = {};
  private rememberMeStatus: boolean;


  constructor(
    private storage: Storage,
    private http: HttpClient,
    private plt: Platform,
    private router: Router,
  ) {
    this.storage.create().then(() => {
      this.loadStoredToken();
    });
  }

  loadStoredToken() {
    let platformObs = from(this.plt.ready());
    this.user = platformObs.pipe(
      map(() => this.handleStoredToken(AuthService.getAuthToken()))
    );
  }

  handleStoredToken(token: string | null) {
    let accountData: any;
    if (token) {
      accountData = this.getUser();
      if (!this.redirectFlag && token === localStorage.getItem(TOKEN_KEY)) {
        this.redirectFlag = true;
        this.router.navigateByUrl('/home');
      }
      return { loggedIn: true, account: accountData };
    } else {
      console.log('No se encontró token almacenado.');
      return { loggedIn: false, account: null };
    }
  }


  handleLoginResponse(response: any, rememberMe: boolean): Observable<any> {
    this.userData.next({ loggedIn: true, account: response.account });
    let storageObs: Observable<any>;

    if (rememberMe) {
      storageObs = from(this.storage.set(TOKEN_KEY, response.access_token));
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.account));
    } else {
      storageObs = defer(() => {
        sessionStorage.setItem(TOKEN_KEY, response.access_token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(response.account));
        return of(response.access_token);
      });
    }
    return storageObs.pipe(map((storedToken) => this.handleStoredToken(storedToken)));
  }

  login(email: string, password: string, rememberMe: boolean) {
    this.userCredential = { email, password };
    this.rememberMeStatus = rememberMe;
    return this.http
      .post(URLAuthLogin, this.userCredential, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            return of(null);
          }
        }),
        switchMap((response) => this.handleLoginResponse(response, rememberMe)),
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
    const localStorageUser = localStorage.getItem('user-data');
    const sessionStorageUser = sessionStorage.getItem('user-data');
    return localStorageUser ? JSON.parse(localStorageUser) : JSON.parse(sessionStorageUser ?? 'null');
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.storage.remove(TOKEN_KEY).then(() => {
      this.router.navigateByUrl('/login');
      this.userData.next({ loggedIn: false, account: null });
    });
  }

  static getTokenParams(): string {
    return '?token=' + AuthService.getAuthToken();
  }

  refreshToken(): Observable<any> {
    const user = this.userCredential;
    return this.http.post(URLAuthLogin, user, httpOptions).pipe(
      map((response: any) => this.handleLoginResponse(response, this.rememberMeStatus)
      ));
  }

  getLoggedAccount(): User {
    return JSON.parse(localStorage.getItem('user-data') ?? '');
  }
}
