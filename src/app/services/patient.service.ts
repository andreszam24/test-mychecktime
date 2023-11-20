import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { URLPatients, URLPatientsByDni, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, from, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class PatientService {

  constructor(private http: HttpClient) { }

 
  searchByDni(text: string): Observable<Array<Patient>> {
    const urlGetPatients = `${URLPatientsByDni}/${text}`;
    return this.http.get<Patient[]>(urlGetPatients + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return response.body;
        } else {
          console.error('Error http en búsqueda de paciente por identificación: ', response.status, response.body);
          return of(null);
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en seachByDni', err, caught);
        return of([]);
      })
    );

  }
}
