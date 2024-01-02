import { Injectable } from '@angular/core';
import { AnesthesiologistProfile } from '../models/anesthesiologist-profile.model';
import { Observable, catchError, map, of } from 'rxjs';
import { URLAnesthesiologist, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AnesthesiologistService {

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  toSearchByName(nombre: string): Observable<AnesthesiologistProfile[]> {
    const url = `${URLAnesthesiologist}`;

    return this.http.get<AnesthesiologistProfile[]>(url + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return response.body;
        } else {
          console.error('Error http en búsqueda de anestesiologo por nombre: ', response.status, response.body);
          return of(null);
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en toSearchByName', err, caught);
        return of([]);
      })
    );
  }
}