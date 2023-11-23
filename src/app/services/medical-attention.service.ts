import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { URLMedicalAttention, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Patient } from '../models/patient.model';
import { MedicalAttention } from '../models/medical-attention.model';







@Injectable({
  providedIn: 'root'
})
export class MedicalAttentionService {

  constructor(private http: HttpClient) { }

  getMedicalAttention(data: Array<MedicalAttention>): Observable<Array<Patient>> {
    return this.http.get(URLMedicalAttention + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          //const patients: Patient[] = response.body; 
          //return patients;
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
}
