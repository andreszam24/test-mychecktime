import { MedicalAttention } from './../../../app/models/medical-attention.model';
import { Component } from '@angular/core';
import { NavController, MenuController, LoadingController } from 'ionic-angular';

import { StatusService } from './../../../app/services/status.service';
import { InProgressMedicalAttention } from './../../../app/services/in-progress-medical-attention.service';
import { PatientsExitList } from './../../../app/models/patients-exit-list.model';
import { Recover } from './../../../app/models/recover.model';

import { DestinoCasaPage } from './../destino-casa/destino-casa';
import { DestinoFallecimientoPage } from './../destino-fallecimiento/destino-fallecimiento';
import { DestinoUCIPage } from './../destino-uci/destino-uci';
import { DestinoHospitalizacionPage } from './../destino-hospitalizacion/destino-hospitalizacion';
import { Patient } from '../../../app/models/patient.model';
import { DestinoCirugiaPage } from '../destino-cirugia/destino-cirugia';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'seleccion-destino-page',
  templateUrl: 'seleccion-destino.html'
})
export class SeleccionDestinoPage {
  
  model: any = {
    aldrete: null,
    bromage: null,
    ramsay: null,
    eva: null,
    nausea: null,
    destino: null,
    fechaOrdenDeSalida: null
  };

  patientExit: PatientsExitList;
  patient: Patient;

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private inProgressRepository: InProgressMedicalAttention,
    public datepipe: DatePipe) {
      this.menu.enable(true, 'menu-anestesia');
      this.patientExit = new PatientsExitList();
  }

  goToNextPage() {
    this.patientExit.destination = this.model.destino;
    this.patientExit.state = StatusService.SELECCION_DESTINO;
    this.patientExit.recover = this.mapViewToModel();
    
    const loading = this.showLoading();

    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      sm.patientsExit = this.patientExit;
      sm.state = this.destinationStatus();

      this.actualizarServicioMedico(sm, loading);

    }).catch(e => {
      loading.dismiss();
      console.log('Error consultando la atencion médica',e);
    });
  }

  private mapViewToModel(): Recover {
    const recover = new Recover();
    recover.aldrete = this.valorNumerico(this.model.aldrete);
    recover.bromage = this.valorNumerico(this.model.bromage);
    recover.ramsay = this.valorNumerico(this.model.ramsay);
    recover.eva = this.model.eva;
    recover.nausea = this.model.nausea;
    recover.state = StatusService.TERMINADO;
    recover.checkDate = this.model.fechaOrdenDeSalida;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate,'yyyy-MM-dd');
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate,'HH:mm:ss');
    return recover;
  }

  private valorNumerico(valor: any): number {
    return valor === '' ? null : valor;
  }

  private redirectToSelectedPage(): void  {
    if(this.model.destino === 'CASA') {
      this.navCtrl.push(DestinoCasaPage);
    } else if(this.model.destino === 'HOSPITALIZACION') {
      this.navCtrl.push(DestinoHospitalizacionPage);
    } else if(this.model.destino === 'UCI') {
      this.navCtrl.push(DestinoUCIPage);
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      this.navCtrl.push(DestinoFallecimientoPage);
    } else if(this.model.destino === 'CIRUGIA') {
      this.navCtrl.push(DestinoCirugiaPage);
    }
  }

  private destinationStatus(): string {
    if(this.model.destino === 'CASA') {
      return StatusService.DESTINO_CASA;
    } else if(this.model.destino === 'HOSPITALIZACION') {
      return StatusService.DESTINO_HOSPITALIZACION;
    } else if(this.model.destino === 'UCI') {
      return StatusService.DESTINO_UCI;
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      return StatusService.DESTINO_SALA_DE_PAZ;
    } else if(this.model.destino === 'CIRUGIA') {
      return StatusService.DESTINO_CIRUGIA;
    }
    return '';
  }

  private actualizarServicioMedico(sm: MedicalAttention, loading: any) {
    this.inProgressRepository.saveMedicalAttention(sm, 'sync')
    .then(result => {
        loading.dismiss();
        if(result) {
          this.redirectToSelectedPage();
        }
    }).catch(err => {
      loading.dismiss();
      console.error('No se pudo guardar el servicio médico',err);
    });
  }

  marcarFechaOrdenDeSalida() {
    if (this.model.fechaOrdenDeSalida === null) {
      this.model.fechaOrdenDeSalida = new Date();
    }
  }

  isValid() {
    const oneOfThree = this.isSetted(this.model.bromage) || this.isSetted(this.model.ramsay) || this.isSetted(this.model.aldrete);
    return this.isSetted(this.model.eva) && oneOfThree && this.model.nausea !== null && this.model.destino;
  }

  private isSetted(valor: any) {
    return valor !== undefined && valor !== null && valor !== '';
  }

  private showLoading(): any {
    let loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Cargando ...',
      dismissOnPageChange: true
    });

    loading.present();
    return loading;
  }

}
