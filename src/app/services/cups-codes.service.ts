import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';
import { LocalPersistenceDataService } from './local-persistence-data.service';
import { URLCupsCodes, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';
import { CupsCodes } from '../models/cups-codes.model';

@Injectable({
    providedIn: 'root',
})

export class CupsCodesService extends LocalPersistenceDataService {
    private localDataKey: string = 'local_cups_code';

    constructor(private http: HttpClient) {
        super();
    }

    getRemoteCups(): Observable<Array<CupsCodes>> {

        return this.http.get<CupsCodes[]>(URLCupsCodes + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
            map((response: HttpResponse<any>) => {
                if (response.status === 200) {
                    this.toSaveCupsLocally(response.body);
                    return response.body;
                } else {
                    console.error('Error http obteniendo los códigos CUPS: ', response.status, response.body);
                    return of(null);
                }
            }),
            catchError((err, caught) => {
                console.error('Error logico en consulta remota de códigos CUPS ', err, caught);
                return of([]);
            })
        );
    }

    getLocalCups(): Array<CupsCodes> {
        let cupsCodes = [];
        if (this.getLocalData(this.localDataKey) != null) {
            cupsCodes = this.getLocalData(this.localDataKey);
        }
        return cupsCodes;
    }

    toSaveCupsLocally(cupsCodes: Array<CupsCodes>) {
        this.saveLocalData(this.localDataKey, cupsCodes);
    }

}