import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MedicalAttention } from '../models/medical-attention.model';
import { MedicalAttentionService } from './medical-attention.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InProgressMedicalAttentionService {

  constructor(private httpMedicalAttention: MedicalAttentionService) { }

  // Consulta los pacientes pendientes 
  searchPendingServices(clinicId: number, anesId: number): Observable<Array<MedicalAttention>> {
    const mySubject = new Subject<Array<MedicalAttention>>();
    this.httpMedicalAttention.findPendingServices(clinicId).pipe(map((response: any) => {
      try {
        const parsedResponse: MedicalAttention[] = JSON.parse(response);
        return parsedResponse;
      } catch (e) {
        console.error('Error al parsear la respuesta JSON:', e);
        return [];
      }
    })).subscribe({
      next: (list: MedicalAttention[]) => {
        mySubject.next(list);
        mySubject.complete(); 
      },
      error: (err: any) => {
        console.error('Observer got an error: ', err);
        mySubject.complete(); 
      },
    });
    return mySubject.asObservable();
  }

}
