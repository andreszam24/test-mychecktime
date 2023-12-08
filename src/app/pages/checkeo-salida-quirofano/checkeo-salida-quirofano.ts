import { StatusService } from './../../app/services/status.service';
import { Component } from '@angular/core';

import { NavController, MenuController, AlertController } from 'ionic-angular';

import { InicioProcesoPage } from './../inicio-proceso/inicio-proceso';
import { ExitOperatingRoomList } from './../../app/models/exit-operating-room-list.model';

import { InProgressMedicalAttention } from './../../app/services/in-progress-medical-attention.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'checkeo-salida-quirofano-page',
  templateUrl: 'checkeo-salida-quirofano.html'
})
export class CkeckeoSalidaQuirofanoPage {

  exitOperatingRoomList: ExitOperatingRoomList;

  model: any = {
    confirmProcedure: false,
    instrumentsCount: false,
    verifyTagsPatient: false,
    problemsResolve: false,
    recoveryReview: null,
    bloodCount: null,
    bloodCountUnits: 'ml'
  };

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private inProgressRepository: InProgressMedicalAttention,
    public datepipe: DatePipe) {

      this.menu.enable(true, 'menu-anestesia');
      this.exitOperatingRoomList = new ExitOperatingRoomList();
  }

  isValid() {
    let valid = true;
    for (var property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if(this.model[property] === null) {
          valid = false;
        }
      }
    }
    return valid;
  }

  checkDate() {
    this.exitOperatingRoomList.checkDate = new Date();
    this.exitOperatingRoomList.simpleCheckDate = this.datepipe.transform(this.exitOperatingRoomList.checkDate,'yyyy-MM-dd');
    this.exitOperatingRoomList.simpleCheckHour = this.datepipe.transform(this.exitOperatingRoomList.checkDate,'HH:mm:ss');
  }

  goToNextPage() {

    const exitOperatingRoomList = this.mapViewToModel();

    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      sm.exitOperatingRoomList = exitOperatingRoomList;
      sm.state = StatusService.EXIT_OPERATING_ROOM_LIST;

      this.inProgressRepository.saveMedicalAttention(sm,'sync')
        .then(result => {
            if(result) {
              this.navCtrl.push(InicioProcesoPage);
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion médica'));
  }

  private mapViewToModel() {
    this.exitOperatingRoomList.confirmProcedure = this.model.confirmProcedure;
    this.exitOperatingRoomList.instrumentsCount = this.model.instrumentsCount;
    this.exitOperatingRoomList.verifyTagsPatient = this.model.verifyTagsPatient;
    this.exitOperatingRoomList.problemsResolve = this.model.problemsResolve;
    this.exitOperatingRoomList.recoveryReview = this.model.recoveryReview;
    this.exitOperatingRoomList.bloodCount = this.model.bloodCount;
    this.exitOperatingRoomList.bloodCountUnits = this.model.bloodCountUnits;
    this.exitOperatingRoomList.endProcedureDate = new Date();
    this.exitOperatingRoomList.simpleEndProcedureDate = this.datepipe.transform(this.exitOperatingRoomList.endProcedureDate,'yyyy-MM-dd');
    this.exitOperatingRoomList.simpleEndProcedureHour = this.datepipe.transform(this.exitOperatingRoomList.endProcedureDate,'HH:mm:ss');
    
    return this.exitOperatingRoomList;
  }

  showConfirmEndProcedure() {
    let alert = this.alertCtrl.create({
      message: `Oprima este botón solo si el paciente se
      encuentra en condiciones de ser trasladado fuera del quirófano.
      ¿Esta seguro que el paciente ya puede ser trasladado?`,
      buttons: [
        {
          text: 'NO',
          role: 'cancel',
          handler: () => { 
            alert.dismiss();
            return false;
          }
        }, {
          text: 'SI',
          handler: () => {
            this.checkDate();
            this.goToNextPage();
          }
        }
      ]
    });
    alert.present();
    return;
  }
}
