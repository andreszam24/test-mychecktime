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


const helper = new JwtHelperService();

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    console.log('entro a interceptor')
    return this.authService.user.pipe(
      switchMap((user) => {
        console.log('entro', user.loggedIn, user.token)
        if (user.loggedIn && user.token) {
          if (helper.isTokenExpired(user.token)) {
            console.log('token expired');
            // token expired 
          } else {
            console.log('token valid');
            // token valid
          }
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
