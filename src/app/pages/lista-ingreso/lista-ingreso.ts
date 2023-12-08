import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { InProgressMedicalAttention } from './../../app/services/in-progress-medical-attention.service';
import { StatusService } from './../../app/services/status.service';

import { AdmissionList } from './../../app/models/admission-list.model';
import { DateUtilsService } from '../../app/services/date-utils.service';
import { DatePipe } from '@angular/common';
import { SeleccionarQuirofanoPage } from '../seleccionar-quirofano/seleccionar-quirofano';
import { SeleccionarPacientePage } from '../seleccionar-paciente/seleccionar-paciente';

@Component({
  selector: 'lista-ingreso-page',
  templateUrl: 'lista-ingreso.html'
})
export class ListaIngresoPage {

  admissionList: AdmissionList;
  flagInputOtherIntervention: Boolean;
  fechaMaxima: string;

  model: any = {
    arrivalDate: null,
    basicConfirmation: false,
    site: false,
    anesthesiaSecurity: false,
    pulsometer: false,
    allergy: null,
    difficultAirway: null,
    riskOfHemorrhage: null,
    intervention: null,
    otherIntervention: ''
  };

  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttention,
    public datepipe: DatePipe) {

      this.admissionList = new AdmissionList();
      this.flagInputOtherIntervention = false;

      this.fechaMaxima = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(new Date()));
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
    this.admissionList.checkDate = new Date();
    this.admissionList.simpleCheckDate = this.datepipe.transform(this.admissionList.checkDate,'yyyy-MM-dd');
    this.admissionList.simpleCheckHour = this.datepipe.transform(this.admissionList.checkDate,'HH:mm:ss');
  }

  changeInterventionDate() {
    
    this.admissionList.interventionDate = new Date();
    this.admissionList.simpleInterventionDate = this.datepipe.transform(this.admissionList.interventionDate,'yyyy-MM-dd');
    this.admissionList.simpleInterventionHour = this.datepipe.transform(this.admissionList.interventionDate,'HH:mm:ss');
    this.validarOtra(this.model.intervention);
  }

  goToNextPage() {
    const admissionList = this.mapViewToModel();

    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.admissionList = admissionList;
      sm.state = StatusService.ADMISSION_LIST;
     this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              this.navCtrl.push(SeleccionarPacientePage);
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion médica'));
  }

  private mapViewToModel() {
    this.admissionList.arrivalDate = DateUtilsService.stringHour2Date(this.model.arrivalDate);
    this.admissionList.simpleArrivalDate = this.datepipe.transform(this.admissionList.arrivalDate,'yyyy-MM-dd');
    this.admissionList.simpleArrivalHour = this.datepipe.transform(this.admissionList.arrivalDate,'HH:mm:ss');

    this.admissionList.basicConfirmation = this.model.basicConfirmation;
    this.admissionList.site = this.model.site;
    this.admissionList.anesthesiaSecurity = this.model.anesthesiaSecurity;
    this.admissionList.pulsometer = this.model.pulsometer;
    this.admissionList.allergy = this.model.allergy;
    this.admissionList.difficultAirway = this.model.difficultAirway;
    this.admissionList.riskOfHemorrhage = this.model.riskOfHemorrhage;

    if(this.model.intervention === 'Otra') {
      this.admissionList.intervention = this.model.otherIntervention;
    }else{
      this.admissionList.intervention = this.model.intervention;
    }
    
    this.admissionList.status = StatusService.TERMINADO;
    return this.admissionList;
  }

  validarOtra(intervention) {
      if(intervention === 'Otra'){
        this.flagInputOtherIntervention = true;
      }else{
        this.flagInputOtherIntervention = false;
      }
  }
}
