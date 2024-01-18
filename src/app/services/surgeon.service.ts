import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cirujano } from '../models/cirujano.model';
import { Observable, of, catchError } from 'rxjs';
import { LocalPersistenceDataService } from './local-persistence-data.service';
import { URLSurgeons, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class SurgeonService extends LocalPersistenceDataService {

  private localDataKey: string = 'local_surgeons';


  constructor(private http: HttpClient) {
    super();
  }

  getListOfSurgeons():Observable<Array<Cirujano>>{

    return this.http.get<Cirujano[]>(URLSurgeons + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
          if (response.status === 200) {
              this.toSaveSurgeonLocally(response.body);
              return response.body;
          } else {
              console.error('Error consumiendo servicio para obtener la lista de cirujanos: ', response.status, response.body);
              return of(null);
          }
      }),
      catchError((err, caught) => {
          console.error('Error logico en consulta remota http la lista de cirujanos: ', err, caught);
          return of([]);
      })
    );

  }

  getLocalSurgeons(): Array<Cirujano> {
    let surgeonsLists = [];
    if (this.getLocalData(this.localDataKey) != null) {
      surgeonsLists = this.getLocalData(this.localDataKey);
    }
    return surgeonsLists;
  }

  toSaveSurgeonLocally(surgeonsLists: Array<Cirujano>){
    this.saveLocalData(this.localDataKey, surgeonsLists);
  }

  searchByName(text: string): Observable<Cirujano[]> {
    if (this.getLocalData(this.localDataKey) != null) {
      return this.getLocalData(this.localDataKey).filter((objCode: Cirujano) => objCode.name.toLowerCase().toString().indexOf(text) !== -1 )
      .map((response:any) => {
        const surgeon: Cirujano = JSON.parse(JSON.stringify(response));
        return of(surgeon);
      }, catchError((err, caught) => {
        console.error('Error logico en searchByName', err, caught);
        return of([]);
      }));
    }else {
      return of([]);
    }
  }

}
