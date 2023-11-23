import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Specialty } from '../models/specialty.model';
import { map } from 'rxjs/operators';
import { Observable, of, catchError } from 'rxjs';
import { LocalPersistenceDataService } from './local-persistence-data.service';
import { URLSpecialties, headers } from '../resources/urls.resource';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})

export class SpecialtyService extends LocalPersistenceDataService {
    private localDataKey: string = 'local_specialties';

    constructor(private http: HttpClient) {
        super();
    }

    getRemoteSpecialties(): Observable<Array<Specialty>> {

        return this.http.get<Specialty[]>(URLSpecialties + AuthService.getTokenParams(), { headers, observe: 'response' }).pipe(
            map((response: HttpResponse<any>) => {
                if (response.status === 200) {
                    this.toSaveSpecialtiesLocally(response.body);
                    return response.body;
                } else {
                    console.error('Error http obteniendo las especialidades: ', response.status, response.body);
                    return of(null);
                }
            }),
            catchError((err, caught) => {
                console.error('Error logico en consulta remota de especialidades', err, caught);
                return of([]);
            })
        );

    }

    getLocalSpecialties(): Array<Specialty> {
        let specialties = [];
        if (this.getLocalData(this.localDataKey) != null) {
            specialties = this.getLocalData(this.localDataKey);
        }
        return specialties;
    }

    toSaveSpecialtiesLocally(specialties: Array<Specialty>){
        this.saveLocalData(this.localDataKey, specialties);
    }

}