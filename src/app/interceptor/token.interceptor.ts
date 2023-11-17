import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable,of } from 'rxjs';
import { catchError, take, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.authService.user.pipe(
      take(1),
    map((user) => {
      console.log('intercept inicio', 'loggedIn: ', user.loggedIn,'token: ' ,user.token);
      if (user && user.loggedIn && user.token) {
        // Token is valid, add it to the request headers
        const modifiedRequest = this.addToken(request, user.token);
        return next.handle(modifiedRequest);
      } 
      else {
        console.log('entro al else para continuar peticion')
        console.log(request)
        return next.handle(request).pipe(
          catchError((error) => {
            console.error('Interceptor error handle:', error);
            throw error; 
          }))
      }
    }),
    catchError((error) => {
      console.error('Interceptor error:', error);
      return of(error);
    }))
  }
  
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    console.log('token',token);
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

}