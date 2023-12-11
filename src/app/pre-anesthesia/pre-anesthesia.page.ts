import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-pre-anesthesia',
  templateUrl: './pre-anesthesia.page.html',
  styleUrls: ['./pre-anesthesia.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PreAnesthesiaPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  /*
  admissionList: AdmissionList;
  flagInputOtherIntervention: boolean;
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
  ngOnInit(): void {
    throw new Error('Method not implemented.');
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
  }*/
}
