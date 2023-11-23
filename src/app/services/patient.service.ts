import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { URLPatients, URLPatientsByDni, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Observable, from, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class PatientService {

    constructor(private http: HttpClient) { }

    getAllPatients(): Observable<Array<Patient>> {
      return this.http.get(URLPatients + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            const patients: Patient[] = response.body; 
            return patients;
          } else {
            console.log('Error consumiendo servicio para obtener los pacientes: ' + response.statusText);
            return [];
          }
        }), catchError((err, caught) => {
          console.error('Error logico en getAllPatients', err, caught);
          return of([]);
        })

      );
    }

   
    searchByDni(text: string) {
        const urlGetPatients = `${URLPatientsByDni}/${text}`;
        return this.http.get(urlGetPatients + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
            map((response: HttpResponse<any>) => {
                if (response.status === 200) {
                    return response.body;
                } else {
                    console.log('usuario no autorizado:', response.status);
                    return of(null);
                }

            }), switchMap(data => {
                let patientObs = from(data);
                return patientObs;
            })
        );

    }
  
}
