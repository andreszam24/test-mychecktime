import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { URLPatients, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Patient } from '../models/patient.model';
import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, from, of } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class PatientService {

    constructor(private http: HttpClient) { }

    /*  getAllPatients(): Observable<Array<Patient>> {
        return this.http.get(URLPatients + AuthService.getTokenParams(), {headers})
          .map( (response) => {
            const patients: Patient[] = JSON.parse(JSON.stringify(response));
            return patients;
          }, (error) => {
            console.log('Error consumiendo servicio para obtener los pacientes: ' + error);
            return [];
          }
          );
      }*/

    getPatientById(id: number) {
        const urlGetById = `${URLPatients}/${id}`;

        return this.http.get(urlGetById + AuthService.getTokenParams(), { headers, observe: 'response'}).pipe(
            map((response: HttpResponse<any>) => {
                if (response.status === 200) {
                    return response.body;
                } else {
                    console.log('usuario no autorizado:', response.status);
                    return of(null);
                }

            }),switchMap((data) => {
                return data;
            })
        );
    }

    /*searchByName(text: string): Observable<Patient> {
      const urlGetPatients = `${URLPatientsByName}/${text}`;
  
      return this.http.get(urlGetPatients + AuthService.getTokenParams(), httpOptions)
      .map((response) => {
        const patient : Patient = JSON.parse(JSON.stringify(response));
        return patient;
      }, (error) => {
        console.log('Error consumiendo el servicio para obtener el paciente por nombre: ' + error);
        Observable.throw(error);
      }); 
    }
  
    searchByDni(text: string): Observable<Patient> {
      const urlGetPatients = `${URLPatientsByDni}/${text}`;
  
      return this.http.get(urlGetPatients + AuthService.getTokenParams(), httpOptions)
      .map((response) => {
        const patient : Patient = JSON.parse(JSON.stringify(response));
        return patient;
      }, (error) => {
        console.log('Error consumiendo el servicio para obtener el paciente por DNI: ' + error);
        Observable.throw(error);
      }); 
    }
  
    createPatient(newPatient: Patient): Observable<Patient> {
  
      return this.http.post(URLPatients + AuthService.getTokenParams(), newPatient, httpOptions)
        .map((response) => {
            const patient : Patient = JSON.parse(JSON.stringify(response));
            return patient;
        },(error) => {
          console.log('Error consumiendo el servicio para crear un paciente: ' + error);
          Observable.throw(error);
        });
    }*/
}
