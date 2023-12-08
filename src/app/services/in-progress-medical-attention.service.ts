import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { MedicalAttention } from '../models/medical-attention.model';
import { MedicalAttentionService } from './medical-attention.service';
import { ServiceStatus } from '../models/service-status.model';
import { StatusService } from './status.service';

@Injectable({
  providedIn: 'root'
})
export class InProgressMedicalAttentionService {

  private finishedServicesKey = 'finished_services';
  private inProgressServicesKey = 'inprogress_services';
  private selectedService: string = '';

  constructor(private httpMedicalAttention: MedicalAttentionService) { }

  // Consulta los pacientes pendientes según la clínica seleccionada
  // y realiza una sincronización de la estructura de datos interna
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
                // Consultar servicios pendientes (locales) (actualizados)
                this.getPendingMedicalAtenttionsByClinic(clinicId, anesId).then(
                  services => {
                    // Enviar guardado de servicios locales (actualizados)
                    this.saveManyRemoteRepository(services).subscribe({
                      next: () => { mySubject.complete(); },
                      error: (e) => {
                        console.error('Error guardando los servicios locales: ', e);
                        mySubject.complete();
                      },
                      complete: () => { mySubject.complete(); }// emit complete http method 
                    });
                  }
                )
              },
              error: (e) => {
                console.error('Error obteniendo los servicios pendientes: ', e);
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
            mySubject.complete();
          }
        });
      }
    });

    return mySubject.asObservable();
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
    const finishedStatuses = statuses.filter(s => this.esEstadoFinalizado(s.status));
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

  private finishServiceRemoteRepository(): Observable<boolean> {
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

  private getFinishedServicesFromLocalRepository(): MedicalAttention[] {
    return JSON.parse(localStorage.getItem(this.finishedServicesKey) ?? '[]');
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

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      return JSON.parse(obj);
    }
    catch (e) {
      console.log(e);
      return [];
    }
  }

}
