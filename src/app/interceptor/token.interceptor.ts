import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import {JwtHelperService} from '@auth0/angular-jwt';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private helper: JwtHelperService ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authService.user.pipe(
      switchMap((user) => {
        console.log('entro', user.loggedIn, user.token)
        if (user.loggedIn && user.token) {
          /*if (this.helper.isTokenExpired(token)) {
           
          } else {
            
          }*/

          const modifiedRequest = this.addToken(request, user.token);
          return next.handle(modifiedRequest);
        } else {
          console.log('entro else')
          return next.handle(request);
        }
      }),
      catchError((error) => {
        console.error('Interceptor error:', error);
        return next.handle(request);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    console.log('Token', token);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
