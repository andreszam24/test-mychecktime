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
        console.log('entro', user.loggedIn, user.token);
        let modifiedRequest: HttpRequest<any>;
        let Token: string | null = null;

        if (user.loggedIn && user.token) {
          Token = AuthService.getAuthToken();
          console.log(Token)
          if (helper.isTokenExpired(Token)) {
            console.log('token expired');
            // token expired 
          } else {
            console.log('token valid');
            modifiedRequest = this.addToken(request, Token!);

            
            // token valid
          }
          return next.handle(modifiedRequest!);
          
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
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
