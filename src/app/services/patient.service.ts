import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  URLPatientsByDni,
  headers,
  headers2,
  URLPatients,
  URLPatientsByClinic,
} from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  // getUser() {
  //   const localStorageUser = localStorage.getItem('user-data');
  //   const sessionStorageUser = sessionStorage.getItem('user-data');
  //   return localStorageUser ? JSON.parse(localStorageUser) : JSON.parse(sessionStorageUser ?? 'null');
  // }

  constructor(private http: HttpClient) {}

  searchPatientClinic(
    dniPatient: string,
    idClinic: string
  ): Observable<Array<Patient>> {
    console.log('entro a consumir aqui');
    const urlGetPatients = `${URLPatientsByClinic}?dniPatient=${dniPatient}&idClinic=${idClinic}&token=${AuthService.getAuthToken()}&startDate=&endDate=`;
    return this.http
      .get<Patient[]>(urlGetPatients, { headers, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            console.log('responseresponse', response.body);
            return response.body;
          } else {
            console.error(
              'Error http en búsqueda de paciente por identificación: ',
              response.status,
              response.body
            );
            return of(null);
          }
        }),
        catchError((err, caught) => {
          console.error('Error logico en seachByDni', err, caught);
          return of([]);
        })
      );
  }

  searchByDni(text: string): Observable<Array<Patient>> {
    const urlGetPatients = `${URLPatientsByDni}/${text}`;
    return this.http
      .get<Patient[]>(urlGetPatients + AuthService.getTokenParams(), {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error(
              'Error http en búsqueda de paciente por identificación: ',
              response.status,
              response.body
            );
            return of(null);
          }
        }),
        catchError((err, caught) => {
          console.error('Error logico en seachByDni', err, caught);
          return of([]);
        })
      );
  }

  getPatientById(id: number): Observable<Patient[]> {
    const urlGetById = `${URLPatients}/${id}`;
    return this.http
      .get<Patient[]>(urlGetById + AuthService.getTokenParams(), {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body;
          } else {
            console.error(
              'Error http en búsqueda de paciente por id: ',
              response.status,
              response.body
            );
            return of(null);
          }
        }),
        catchError((err, caught) => {
          console.error('Error logico en getPatientById', err, caught);
          return of([]);
        })
      );
  }
}
