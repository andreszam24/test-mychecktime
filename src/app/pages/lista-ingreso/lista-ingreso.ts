import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AdmissionList } from 'src/app/models/admission-list.model';
import { DateUtilsService } from 'src/app/services/date-utils.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';

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
    private medicalService: InProgressMedicalAttentionService,
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
    this.admissionList.simpleCheckDate = this.transformSimpleDate(this.admissionList.checkDate);
    this.admissionList.simpleCheckHour = this.transformSimpleHour(this.admissionList.checkDate);
  }

  changeInterventionDate() {
    
    this.admissionList.interventionDate = new Date();
    this.admissionList.simpleInterventionDate = this.transformSimpleDate(this.admissionList.interventionDate);
    this.admissionList.simpleInterventionHour = this.transformSimpleHour(this.admissionList.interventionDate);
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
              this.navCtrl.navigateForward('home');
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion médica'));
  }

  private mapViewToModel() {
    this.admissionList.arrivalDate = DateUtilsService.stringHour2Date(this.model.arrivalDate);
    this.admissionList.simpleArrivalDate = this.transformSimpleDate(this.admissionList.arrivalDate);
    this.admissionList.simpleArrivalHour = this.transformSimpleHour(this.admissionList.arrivalDate);

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

  validarOtra(intervention: string) {
      if(intervention === 'Otra'){
        this.flagInputOtherIntervention = true;
      }else{
        this.flagInputOtherIntervention = false;
      }
  }

  transformSimpleDate(date: Date){
    return this.datepipe.transform(date,'yyyy-MM-dd') ?? '';
    
  }

  transformSimpleHour(date: Date){
    return this.datepipe.transform(date,'HH:mm:ss') ?? '';
  }
}
