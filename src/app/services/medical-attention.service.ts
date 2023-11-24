import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { headers, URLPendingMedicalAttention } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';
import { MedicalAttention } from '../models/medical-attention.model';

@Injectable({
  providedIn: 'root'
})

export class MedicalAttentionService {

  constructor(private http: HttpClient) { }

  findPendingServices(clinicId: number): Observable<Array<MedicalAttention>> {
    const payload = {
      clinic_id: clinicId
    };

    return this.http.post<MedicalAttention[]>(URLPendingMedicalAttention + AuthService.getTokenParams(),payload , { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return response.body;
        } else {
          console.error('Error http en búsqueda de atenciones medicas pendientes: ', response.status, response.body);
          return of(null);
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en findPendingServices', err, caught);
        return of([]);
      })
    );
  }
}
