import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { DateUtilsService } from 'src/app/services/utilities/date-utils.service';
import { AdmissionList } from 'src/app/models/admission-list.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { IonDatetime, IonDatetimeButton, IonModal, IonSelectOption, IonTextarea} from '@ionic/angular/standalone';
import { EventsPanelComponent } from '../../components/events-panel/events-panel.component';




@Component({
  selector: 'app-pre-anesthesia',
  templateUrl: './pre-anesthesia.page.html',
  styleUrls: ['./pre-anesthesia.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, IonSelectOption, DatePipe, IonModal, IonDatetimeButton, IonDatetime, IonTextarea, EventsPanelComponent]
})
export class PreAnesthesiaPage implements OnInit {

  @ViewChild('dateTimeButton') dateTimeButton: IonDatetime;


  barcodes: Barcode[] = [];
  isSupported = false;
  admissionList: AdmissionList;
  flagInputOtherIntervention: boolean;
  fechaMaxima: string;

  model: any = {
    arrivalDate: new Date(),
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

  datepipe = new DatePipe('en-US');

  constructor(
    private alertService: AlertService,
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
  ) {
    this.admissionList = new AdmissionList();
    this.flagInputOtherIntervention = false;
    this.fechaMaxima = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(new Date()));
   }

  ngOnInit() {
    this.startBarcodeScanner();
  }




  private startBarcodeScanner() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async (error) => {
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para usar el escáner de códigos!');
      return;
    }

    // NOTE: To avoid that scan it doesn't work, you may use 5.0.3 version or higher: npm i @capacitor-mlkit/barcode-scanning@5.0.3
    //Check if the Google ML Kit barcode scanner is available
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then(async (data) => {
      if (data.available) {
        // Start the barcode scanner
        await this.readQR();
      } else {
        // Install the Google ML Kit barcode scanner
        await BarcodeScanner.installGoogleBarcodeScannerModule().then(async () => {
          await this.readQR();
        });
      }
    }).catch(error => {
      console.error(error.message);
    });

  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    this.model.basicConfirmation = qr.basicConfirmation;
    this.model.site= qr.site;
    this.model.anesthesiaSecurity= qr.anesthesiaSecurity;
    this.model.pulsometer = qr.pulsometer;
    this.model.allergy = qr.allergy;
    this.model.difficultAirway = qr.difficultAirway;
    this.model.riskOfHemorrhage = qr.riskOfHemorrhage;
    this.model.intervention = qr.intervention;
    
    //TODO: hacer que seleccione especialidad o cups sino se encuentran 
    //this.setFormPatient();
    //this.cdr.detectChanges();
    //this.changeStatusManulIntake(false);
    //this.changeStatusLookingForPatient(false);
  }

  private async unsupportedBarcodeMessage() {
    this.alertService.presentBasicAlert('¡Ups!',
      'Parece que tu dispositivo no puede escanear códigos' +
      ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
    );
  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      obj = JSON.parse(obj);
      return obj;
    }
    catch (e) {
      console.log(e);
      return {};
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  isValid() {
    let valid = true;
    for (let property in this.model) {
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
    this.checkDate();
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
    this.model.arrivalDate = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(this.model.arrivalDate));
    this.admissionList.arrivalDate = DateUtilsService.stringHour2Date(this.model.arrivalDate);
    this.admissionList.simpleArrivalDate = this.datepipe.transform(this.admissionList.arrivalDate,'yyyy-MM-dd')!;
    this.admissionList.simpleArrivalHour = this.datepipe.transform(this.admissionList.arrivalDate,'HH:mm:ss')!;
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
