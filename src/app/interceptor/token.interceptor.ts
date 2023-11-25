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
    return this.authService.user.pipe(
      switchMap((user) => {
        let modifiedRequest: HttpRequest<any>;
        let Token: string | null = null;
        if (user.loggedIn && user.account) {
          Token = AuthService.getAuthToken();
          if (helper.isTokenExpired(Token)) {
            this.authService.refreshToken();
            Token = AuthService.getAuthToken();
            modifiedRequest = this.addToken(request, Token!);
          } else {
            modifiedRequest = this.addToken(request, Token!);
          }
          return next.handle(modifiedRequest!);
        } else {
          return next.handle(request);
        }
      }),
      catchError((error) => {
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
