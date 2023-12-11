import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { headers, URLDeleteClinicalRecord, URLPendingMedicalAttention, URLStatusMedicalAttention, URLUpdateMedicalAttention } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';
import { MedicalAttention } from '../models/medical-attention.model';
import { ServiceStatus } from '../models/service-status.model';

@Injectable({
  providedIn: 'root'
})

export class MedicalAttentionService {

  constructor(private http: HttpClient) { }

  findPendingServices(clinicId: number): Observable<Array<MedicalAttention>> {
    const payload = {
      clinic_id: clinicId
    };

    return this.http.post<MedicalAttention[]>(URLPendingMedicalAttention + AuthService.getTokenParams(), payload, { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return JSON.parse(response.body);
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

  deleteClinicalPatientRecord(medicalAttention: MedicalAttention): Observable<string> {
    const payload = {
      registroClinicoId: medicalAttention._id
    };

    return this.http.post<string>(URLDeleteClinicalRecord + AuthService.getTokenParams(), payload, { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return response.body;
        } else {
          console.error('Error borrando paciente: ', response.status, response.body);
          return of(null);
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en deleteClinicalPatientRecord', err, caught);
        return of('');
      })
    );

  }

  searchStatus(ids: Array<string>): Observable<Array<ServiceStatus>> {
    return this.http.post(URLStatusMedicalAttention + AuthService.getTokenParams(), ids, { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return JSON.parse(response.body);
        } else {
          console.error('Error consultando el estado de la atención medica: ', response.status, response.body);
          return of(null);
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en searchStatus', err, caught);
        return of([]);
      })
    );
  }

  saveMedicalAttention(data: Array<MedicalAttention>): Observable<boolean> {
    return this.http.post(URLUpdateMedicalAttention + AuthService.getTokenParams(), data, { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200) {
          return true;
        } else {
          console.error('Error guardando la atención medica: ', response.status, response.body);
          return false;
        }
      }),
      catchError((err, caught) => {
        console.error('Error logico en saveMedicalAtterion', err, caught);
        return of(false);
      })
    );
  }

}
