import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, Subject, timeout } from 'rxjs';
import { MedicalAttention } from '../models/medical-attention.model';
import { MedicalAttentionService } from './medical-attention.service';
import { ServiceStatus } from '../models/service-status.model';
import { StatusService } from './status.service';
import { WorkingAreaService } from './working-area.service';
import { AuthService } from './auth.service';
import { Toast } from '@capacitor/toast';
import { v4 as uuidv4 } from 'uuid';
import { ParametersTimeCalculation } from '../models/parameters-time-calculation.model';
import { URLChangePatientTime, headers } from '../resources/urls.resource';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InProgressMedicalAttentionService {

  private finishedServicesKey = 'finished_services';
  private inProgressServicesKey = 'inprogress_services';
  private selectedService: string = '';

  constructor(
    private http: HttpClient,
    private httpMedicalAttention: MedicalAttentionService,
    private workingArea: WorkingAreaService,
    private auth: AuthService,
  ) { }


  saveMedicalAttention(attention: MedicalAttention, sync: String): Promise<boolean> {
    return new Promise((resolve) => {

      if (attention.state === StatusService.TERMINADO || attention.state === StatusService.CANCELADO) {
        this.saveInFinishedServices(attention);
        this.deleteFromProgressServices(attention);
        this.finishServiceRemoteRepository().subscribe({
          next: (resp) => {
            resolve(true);
          }, 
          error: (e) => {
            console.log('IN-PROGRESS-MEDICAL-ATTENTION-SERVICE L221: Ocurrio un error terminando el servicio remoto ', e);
            resolve(false);
          },
          complete: () =>{}
        });
      } else {
        this.replaceLocalService(attention);
        this.updateRemoteRepository(attention, () => { });
        resolve(true);
      }
      if (sync === 'sync') {
        this.searchPendingServices(this.workingArea.getClinic().id, this.auth.getLoggedAccount().id).subscribe({
          next: (resp) => { this.showToast("Sincronizando con servidor", 'long', 'center'); },
          error: (e) => this.showToast('Ups! algo salio mal, por favor reintenta', 'long', 'center'),
          complete: () => {

            resolve(true);
          }
        });
      }
    });
  }

  async showToast(toastText: string, toastDuration: 'short' | 'long', toastPosition: 'top' | 'center' | 'bottom') {
    await Toast.show({
      text: toastText,
      duration: toastDuration,
      position: toastPosition,
    });
  };

  private deleteFromProgressServices(sm: MedicalAttention) {
    const list = this.loadServicesFromLocalRepository() || [];
    const allServices = list.filter(s => s._id !== sm._id);
    this.updateLocalRepository(allServices);
  }

  private saveInFinishedServices(sm: MedicalAttention) {
    const finishedServices: Array<MedicalAttention> = this.getFinishedServicesFromLocalRepository();
    finishedServices.push(sm);
    localStorage.setItem(this.finishedServicesKey, JSON.stringify(finishedServices));
  }

  calculateChangePatientTime(parameters: ParametersTimeCalculation): Observable<string> {
    return this.http.post<string>(URLChangePatientTime + AuthService.getTokenParams(), parameters, { headers, observe: 'response' }).pipe(
      // timeout(7000),
      map((response: HttpResponse<string>) => {
        if (response.status === 200) {
          return JSON.stringify(response.body).replace(/\\/g, "");
        } else {
          console.error('HTTP error calculateChangePatientTime: ', response.status, response.body);
          return ''; 
        }
      }),
      catchError((err, caught) => {
        console.error('in-progress-medical-attention: calculateChangePatientTime =>', err, caught);
        return of(''); 
      })
    );
  }

  private updateRemoteRepository(medicalAttention: MedicalAttention, onResult: () => void) {
    // Se invoca onResult al terminar la peticion sin importar el resultado
    this.httpMedicalAttention.saveMedicalAttention([medicalAttention])
      .subscribe(result => {
        onResult();
      }, e => {
        console.log('No se pudo actualizar el repositorio remoto', e);
        onResult();
      });
  }

  addMedicalAttention(attention: MedicalAttention): Promise<MedicalAttention> {
    return new Promise((resolve) => {
      const list = this.loadServicesFromLocalRepository();
      attention._id = uuidv4();
      const serviceList = list || [];
      serviceList.push(attention);
      this.updateLocalRepository(serviceList);
      this.updateRemoteRepository(attention, () => {
        resolve(attention);
      });
    });
  }

  searchPendingServices(clinicId: number, anesId: number): Observable<Array<MedicalAttention>> {
    const mySubject = new Subject<Array<MedicalAttention>>();
    const locals = this.loadServicesFromLocalRepository() || [];
    const ids = locals.map(attention => attention._id);

    this.httpMedicalAttention.searchStatus(ids).subscribe({
      next: (statuses) => {
        this.deleteFinishedServices(statuses);
      },
      error: (e) => {
        console.log('in-progress-medical: searchPendingServices => ', e);
        mySubject.complete();
      },
      complete: () => {
        // enviar servicios terminados
        this.finishServiceRemoteRepository().subscribe({
          next: (resp) => {
            // Consultar servicio pendientes registrados en el servidor
            this.httpMedicalAttention.findPendingServices(clinicId).subscribe({
              next: (list) => {
                // Actualizar localmente
                this.mergeServices(list);
                mySubject.next(list);
                // Consultar servicios pendientes (locales) (actualizados)
                this.getPendingMedicalAtenttionsByClinic(clinicId, anesId).then(
                  services => {
                    // Enviar guardado de servicios locales (actualizados)
                    this.saveManyRemoteRepository(services).subscribe({
                      next: () => {                         
                        mySubject.complete(); },
                      error: (e) => {
                        console.error('Error guardando los servicios locales: ', e);
                        mySubject.complete();
                      },
                      complete: () => { 
                        mySubject.complete(); }// emit complete http method 
                    });
                  }
                )
              },
              error: (e) => {
                console.error('Error obteniendo los servicios pendientes: ', e);
                mySubject.complete();
              },
              complete: () => {
                mySubject.complete();
              }
            });
          },
          error: (e) => {
            console.log('IN-PROGRESS-MEDICAL-ATTENTION-SERVICE L112: Ocurrio un error terminando el servicio remoto ', e);
            mySubject.complete();
          },
          complete: () => {
            //mySubject.complete();
          }
        });
      }
    });

    return mySubject.asObservable();
  }

  existsPatientInProgressAttentions(clinic: number, anesthesiologist: number, dni: string) {
    const inProgressServices = this.filterByClinic(this.loadServicesFromLocalRepository(), clinic, anesthesiologist);
    const inProgressServiceByPatient = inProgressServices.filter(s => !!s.patient && s.patient.dni === dni);
    return inProgressServiceByPatient.length > 0;
  }

  saveManyRemoteRepository(medicalAttentions: MedicalAttention[]): Observable<boolean> {
    const sbjResult = new Subject<boolean>();
    this.httpMedicalAttention.saveMedicalAttention(medicalAttentions).subscribe(
      (result) => {
        if (result) {
          sbjResult.next(true);
          sbjResult.complete();
        } else {
          sbjResult.next(false);
          sbjResult.complete();
        }
      });

    return sbjResult.asObservable();
  }

  getPendingMedicalAtenttionsByClinic(clinicId: number, anesthesiologistId: number): Promise<Array<MedicalAttention>> {
    return new Promise((resolve) => {
      const locals = this.loadServicesFromLocalRepository() || [];
      resolve(this.filterAllByClinic(locals, clinicId, anesthesiologistId));
    });
  }

  getPendingMedicalAtenttions(clinicId: number, anesthesiologistId: number): Promise<Array<MedicalAttention>> {
    return new Promise((resolve) => {
      const locals = this.loadServicesFromLocalRepository() || [];
      resolve(this.filterByClinic(locals, clinicId, anesthesiologistId));
    });
  }

  private filterByClinic(attentions: MedicalAttention[], clinicId: number, anesthesiologist: number): MedicalAttention[] {
    if (!(!!attentions)) {
      return [];
    }

    return attentions
      .filter(a => !!a.idClinica && a.idClinica === clinicId)
      .filter(a => !!a.currentAnesthesiologist && a.currentAnesthesiologist.id === anesthesiologist);
  }

  private filterAllByClinic(attentions: MedicalAttention[], clinicId: number, anesthesiologist: number): MedicalAttention[] {
    if (!(!!attentions)) {
      return [];
    }

    return attentions
      .filter(a => !!a.idClinica && a.idClinica === clinicId)
      .filter(a => !!a.currentAnesthesiologist && a.currentAnesthesiologist.id === anesthesiologist);
  }

  private mergeServices(remoteServices: MedicalAttention[]): MedicalAttention[] {
    let localServices = this.loadServicesFromLocalRepository() || [];
    const finishedServices = this.getFinishedServicesFromLocalRepository();

    remoteServices = remoteServices || [];

    remoteServices.forEach(sr => {
      /* 
       Se agrega el servicio remoto si:
       * No existe en la lista de servicios locales.
       * No se encuentra en los servicios finalizados.
       * Se encuentra localmente pero el estado es mayor al local.
       */
      const sameServicesFound = localServices.find(sl => sr._id === sl._id);
      const sameFinishedServicesFound = finishedServices.find(sf => sr._id === sf._id);
      if ((sameServicesFound === undefined || sameServicesFound === null) &&
        (sameFinishedServicesFound === undefined || sameFinishedServicesFound === null)) {
        localServices.push(sr);
      } else if (!!sameServicesFound) {
        if (StatusService.isAfter(sr.state, sameServicesFound.state)) {

          this.replaceLocalService(sr);
          localServices = this.loadServicesFromLocalRepository() || [];
        }
      }
    });

    this.updateLocalRepository(localServices);
    return localServices;
  }

  private replaceLocalService(sm: MedicalAttention) {
    const list = this.loadServicesFromLocalRepository();
    const serviceId = sm._id;
    const allServices = list || [];
    for (var i = 0; i < allServices.length; i++) {
      if (allServices[i]._id === serviceId) {
        allServices[i] = sm;
      }
    }
    this.updateLocalRepository(allServices);
  }

  private loadServicesFromLocalRepository(): MedicalAttention[] {
    return JSON.parse(localStorage.getItem(this.inProgressServicesKey) ?? '[]');
  }

  private deleteFinishedServices(statuses: Array<ServiceStatus>) {
      const finishedStatuses = statuses.filter(s => this.esEstadoFinalizado(s.status) == true);
      if (finishedStatuses.length > 0) {
        let locals = this.loadServicesFromLocalRepository() || [];
        // Excluir de la lista cada servicio en la lista de servicios finalizados
        finishedStatuses.forEach(status => {
          locals = locals.filter(s => s._id !== status.id);
        });
        // Actualizar repositorio
        this.updateLocalRepository(locals);
      }
  }

  private esEstadoFinalizado(estado: string): boolean {
    return estado === StatusService.TERMINADO || estado === StatusService.CANCELADO;
  }

  private updateLocalRepository(allServices: MedicalAttention[]) {
    localStorage.setItem(this.inProgressServicesKey, JSON.stringify(allServices));
  }

  finishServiceRemoteRepository(): Observable<boolean> {
    const finishedServices: Array<MedicalAttention> = this.getFinishedServicesFromLocalRepository();
    const sbjResult = new Subject<boolean>();
    this.httpMedicalAttention.saveMedicalAttention(finishedServices).subscribe(
      (result) => {
        if (result) {
          localStorage.setItem(this.finishedServicesKey, JSON.stringify([]));
          sbjResult.next(true);
          sbjResult.complete();
        } else {
          sbjResult.next(false);
          sbjResult.complete();
        }
      });

    return sbjResult.asObservable();
  }

  getFinishedServicesFromLocalRepository(): MedicalAttention[] {
    return JSON.parse(localStorage.getItem(this.finishedServicesKey) ?? '[]');
  }
  updateFinishedServiceList() {
    return this.getFinishedServicesFromLocalRepository();
  }

  selectMedicalAttention(atention: string) {
    this.selectedService = atention;
  }

  getInProgressMedicalAtenttion(): Promise<MedicalAttention> {
    return new Promise((resolve) => {
      const list = this.loadServicesFromLocalRepository() || [];
      const result = list.find(sm => sm._id === this.selectedService);
      if (result) {
        resolve(result);
      } else {
        resolve(new MedicalAttention());
      }
    });
  }

  borrarServicioLocal(sm: MedicalAttention) {
    this.deleteFromProgressServices(sm);
  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      return JSON.parse(obj);
    }
    catch (e) {
      console.log(e);
      return [];
    }
  }
  
  clearInProgressServices() {
    this.updateLocalRepository([]);
  }

}
