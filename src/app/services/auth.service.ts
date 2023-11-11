import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, Subject, from, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { URLAuthLogin, httpOptions, optionsCredentials } from '../resources/urls.resource';
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

  login(email: string, password: string): Promise<any> {
    const user = { email, password };
    return this.http.post(URLAuthLogin, user, optionsCredentials)
    .toPromise()
            .then(data => {
              console.log(data);
          return data;
      })
      .catch(error => {
          console.log('There was an error!', error);
          return error;
      });

    /*this.http.post(URLAuthLogin, user, { headers, observe: 'response' })
      .pipe(catchError((error: any): Observable<any> => {

        console.error('There was an error!', error.message);
subject.next('error consuminedo post auth');
        // after handling error, return a new observable 
        // that doesn't emit any values and completes
        return subject;
      }))
      .subscribe(data => {
        subject.next(data);
        console.log('OK', data);
        return subject;
      });

      return subject;*/
    /*.pipe(map((response: HttpResponse<any>) => {
        if (response.status === 200) {
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
      }), 
      catchError((error) => {
        console.error('Error en post login ', error.message);
        return of(null);
      })
    );*/
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


