import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';
import { OperationRoom } from '../models/operationRoom.model';
import { URLOperationRooms, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';
import { LocalPersistenceDataService } from './local-persistence-data.service';

@Injectable({
  providedIn: 'root'
})
export class OperationRoomService extends LocalPersistenceDataService {

  private localDataKey: string = 'local_operation_rooms';


  constructor(private http: HttpClient) {
    super();
  }

getOperationRoomsByClinic(): Observable<Array<OperationRoom>> {

    return this.http.get<OperationRoom[]>(URLOperationRooms + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
        map((response: HttpResponse<any>) => {
            if (response.status === 200) {
                this.toSaveOperationRoomsLocally(response.body);
                return response.body;
            } else {
                console.error('Error http obteniendo los salas de operaciónes asociadas a esta clinica: ', response.status, response.body);
                return of(null);
            }
        }),
        catchError((err, caught) => {
            console.error('Error logico en consulta remota de salas de operaciónes asociadas a esta clinica ', err, caught);
            return of([]);
        })
    );
}

getLocalRooms(): Array<OperationRoom> {
  let operationRoomsLists = [];
  if (this.getLocalData(this.localDataKey) != null) {
    operationRoomsLists = this.getLocalData(this.localDataKey);
  }
  return operationRoomsLists;
}

toSaveOperationRoomsLocally(operationRoomsList: Array<OperationRoom>) {
  this.saveLocalData(this.localDataKey, operationRoomsList);
}

}
