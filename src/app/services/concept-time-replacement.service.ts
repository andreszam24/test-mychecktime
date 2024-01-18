import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalPersistenceDataService } from './local-persistence-data.service';
import { ConceptoTiempoRecambio } from '../models/concepto-tiempo-recambio.model';
import { Observable, of, catchError } from 'rxjs';
import { URLConceptTimeReplacement, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';





@Injectable({
  providedIn: 'root'
})
export class ConceptTimeReplacementService extends LocalPersistenceDataService{

  private localDataKey: string = 'local_concept_time_replacement';

  constructor(private http: HttpClient) {
    super();
  }

  getListConceptTimeReplacement():Observable<Array<ConceptoTiempoRecambio>>{

    return this.http.get<ConceptoTiempoRecambio[]>(URLConceptTimeReplacement + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
          if (response.status === 200) {
              this.toSaveConceptTimeReplacementLocally(response.body);
              return response.body;
          } else {
              console.error('Error http obteniendo la lista de conceptos de tiempo de recambio: ', response.status, response.body);
              return of(null);
          }
      }),
      catchError((err, caught) => {
          console.error('Error logico en consulta remota http la lista de conceptos de tiempo de recambio ', err, caught);
          return of([]);
      })
    );
  }

  getLocalConceptTimeReplacement(): Array<ConceptoTiempoRecambio> {
    let conceptoTiempoRecambio = [];
    if (this.getLocalData(this.localDataKey) != null) {
      conceptoTiempoRecambio = this.getLocalData(this.localDataKey);
    }
    return conceptoTiempoRecambio;
  }

  toSaveConceptTimeReplacementLocally(operationRoomsList: Array<ConceptoTiempoRecambio>) {
    this.saveLocalData(this.localDataKey, operationRoomsList);
  }

  searchByName(text: string): Observable<ConceptoTiempoRecambio[]> {
    if (this.getLocalData(this.localDataKey) != null) {
      return this.getLocalData(this.localDataKey).filter((objCode: ConceptoTiempoRecambio) => objCode.name.toLowerCase().toString().indexOf(text) !== -1 )
      .map((response:any) => {
        const conceptTimeReplacement : ConceptoTiempoRecambio = JSON.parse(JSON.stringify(response));
        return of(conceptTimeReplacement);
      }, catchError((err, caught) => {
        console.error('Error logico en searchByName', err, caught);
        return of([]);
      }));
    }else {
      return of([]);
    }
  }

}
