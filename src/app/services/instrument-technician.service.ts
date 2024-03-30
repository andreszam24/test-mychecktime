import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Instrumentador } from '../models/instrumentador.model';
import { Observable, of, catchError } from 'rxjs';
import { LocalPersistenceDataService } from './local-persistence-data.service';
import { URLInstrumentTechnicians, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InstrumentTechnicianService extends LocalPersistenceDataService {

  private localDataKey: string = 'local_instrument_technicians';


  constructor(private http: HttpClient) {
    super();
  }

  getListOfInstrumentTechnicians():Observable<Array<Instrumentador>>{

    return this.http.get<Instrumentador[]>(URLInstrumentTechnicians + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
          if (response.status === 200) {
              this.toSaveInstrumentTechniciansLocally(response.body);
              return response.body;
          } else {
              console.error('Error consumiendo servicio para obtener la lista de instrumentadores: ', response.status, response.body);
              return of(null);
          }
      }),
      catchError((err, caught) => {
          console.error('Error logico en consulta remota http la lista de instrumentadores: ', err, caught);
          return of([]);
      })
    );

  }

  getLocalInstrumentTechnicians(): Array<Instrumentador> {
    let instrumentTechniciansLists = [];
    if (this.getLocalData(this.localDataKey) != null) {
      instrumentTechniciansLists = this.getLocalData(this.localDataKey);
    }
    return instrumentTechniciansLists;
  }

  toSaveInstrumentTechniciansLocally(InstrumentTechniciansLists: Array<Instrumentador>){
    this.saveLocalData(this.localDataKey, InstrumentTechniciansLists);
  }

  searchByName(text: string): Observable<Instrumentador[]> {
    if (this.getLocalData(this.localDataKey) != null) {
      return this.getLocalData(this.localDataKey).filter((objCode: Instrumentador) => objCode.name.toLowerCase().toString().indexOf(text) !== -1 )
      .map((response:any) => {
        const instrumentTechnician: Instrumentador = JSON.parse(JSON.stringify(response));
        return of(instrumentTechnician);
      }, catchError((err, caught) => {
        console.error('Error logico en searchByName', err, caught);
        return of([]);
      }));
    }else {
      return of([]);
    }
  }


}
