import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { DateUtilsService } from 'src/app/services/utilities/date-utils.service';
import { AdmissionList } from 'src/app/models/admission-list.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import {
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonSelectOption,
  IonTextarea,
} from '@ionic/angular/standalone';
import { EventsPanelComponent } from '../../components/events-panel/events-panel.component';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { AudioAlertComponent } from 'src/app/components/audio-alert/audio-alert.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { USER_KEY } from 'src/app/services/auth.service';
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';

@Component({
  selector: 'app-pre-anesthesia',
  templateUrl: './pre-anesthesia.page.html',
  styleUrls: ['./pre-anesthesia.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonSelectOption,
    DatePipe,
    IonModal,
    IonDatetimeButton,
    IonDatetime,
    IonTextarea,
    EventsPanelComponent,
    PreScanQrComponent,
    ButtonPanelComponent,
    AudioAlertComponent,
  ],
})
export class PreAnesthesiaPage implements OnInit {
  @ViewChild('dateTimeButton') dateTimeButton: IonDatetime;

  showAudioAlert = false;
  header = 'Validación lista de Pre-anestesia';
  scannDataForm = false;
  manualIntake = false;
  alertButtons = [
    {
      text: 'Volver',
      cssClass: 'alert-button-cancel space-cancel-audio',
      role: 'cancel',
      handler: () => {
        this.navCtrl.back();
      },
    },
  ];
  textValidate =
    'CONFIRME LA IDENTIDAD DEL PACIENTE, EL CONSENTIMIENTO, EL PROCEDIMIENTO Y SU LATERALIDAD. VERIFIQUE LOS SIGNOS VITALES, SI TIENE ALGUNA ALERGIA, LA VIA AÉREA DEL PACIENTE, Y EL RIESGO DE SANGRADO. ANTES DE INGRESAR REVISE LOS DISPOSITIVOS Y LA MÁQUINA DE ANESTESIA, LOS MEDICAMENTOS Y EL EQUIPO DE VIA AEREA.';
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
    otherIntervention: '',
  };
  datepipe = new DatePipe('en-US');
  dataUser: any;
  audioSrc: string;

  constructor(
    private alertService: AlertService,
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private modalCtrl: ModalController
  ) {
    this.admissionList = new AdmissionList();
    this.flagInputOtherIntervention = false;
    this.fechaMaxima = DateUtilsService.iso8601DateTime(
      DateUtilsService.toColombianOffset(new Date())
    );
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.openModal();
    this.initializeModel();
  }

  initializeModel() {
    if (this.idRole) {
      this.audioSrc = './../../../assets/audio/Audio_1_Sec.mp3';
      this.textValidate =
        'CONFIRME IDENTIDAD, CONSENTIMIENTO, PROCEDIMIENTO Y LATERALIDAD. VERIFIQUE SIGNOS VITALES, ALERGIAS Y VÍA AÉREA. REVISE DISPOSITIVOS, MÁQUINA, MEDICAMENTOS Y EQUIPO DE VÍA AÉREA.';
    } else {
      this.audioSrc = './../../../assets/audio/Audio_1.mp3';
      this.textValidate =
        'ANTES DE INGRESAR AL QUIRÓFANO, CONFIRME LA IDENTIDAD DEL PACIENTE, EL CONSENTIMIENTO, EL PROCEDIMIENTO Y LA LATERALIDAD. VERIFIQUE LOS SIGNOS VITALES, LA PRESENCIA DE ALERGIAS, LA VÍA AÉREA Y EL RIESGO DE SANGRADO. REVISE LOS DISPOSITIVOS MÉDICOS, LA MÁQUINA DE ANESTESIA, LOS MEDICAMENTOS Y EL EQUIPO DE MANEJO DE LA VÍA AÉREA.';
    }
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.id === 870;
  }

  async openModal() {
    const textoModal =
      'ESTA LISTA DE VERIFICACIÓN SE REALIZA IDEALMENTE EN EL ÁREA PRE-OPERATORIA.';
    const modal = await this.modalCtrl.create({
      component: PreScanQrComponent,
      componentProps: {
        text: textoModal,
      },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data === 'scan') {
      this.startBarcodeScanner();
    } else if (data === 'demo') {
      this.showDemoOptions();
    } else {
      this.navCtrl.navigateForward('home');
    }
  }

  async startBarcodeScanner() {
    BarcodeScanner.isSupported()
      .then((result) => {
        this.isSupported = result.supported;
        this.scan();
      })
      .catch(async (error) => {
        console.error('startBarcodeScanner pre-anes', error.message);
        await this.unsupportedBarcodeMessage();
      });
  }
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  handleOpenPermission = async () => {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
    this.navCtrl.navigateForward('home');
  };

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertService.presentActionAlertCustom(
        '¡Ups! Sin permisos',
        '¡Activa los permisos de la cámara para usar el escáner de códigos!',
        this.handleOpenPermission,
        () => this.navCtrl.navigateForward('home')
      );
      return;
    }

    // NOTE: To avoid that scan it doesn't work, you may use 5.0.3 version or higher: npm i @capacitor-mlkit/barcode-scanning@5.0.3
    //Check if the Google ML Kit barcode scanner is available
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
      .then(async (data) => {
        if (data.available) {
          // Start the barcode scanner
          await this.readQR();
        } else {
          // Install the Google ML Kit barcode scanner
          await BarcodeScanner.installGoogleBarcodeScannerModule().then(
            async () => {
              await this.readQR();
            }
          );
        }
      })
      .catch((error) => {
        this.showAudioAlert = false;
        if (error.message === 'scan canceled.') {
          this.alertService.presentActionAlert(
            '¡Ups! Parece que cancelaste el escaneo',
            'Por favor, escanea el código QR de area pre-operatoria para continuar.',
            () => {
              this.navCtrl.navigateForward('home');
            }
          );
        } else if (
          error.message.includes('device') ||
          error.message.includes('camera')
        ) {
          this.alertService.presentActionAlert(
            '¡Ups! Parece que hay un problema con tu dispositivo o cámara',
            'Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.',
            () => {
              this.navCtrl.navigateForward('home');
            }
          );
        } else {
          console.error(error.message);
          this.navCtrl.navigateForward('home');
        }
      });
  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    if (qr && qr.basicConfirmation) {
      this.model.basicConfirmation = qr.basicConfirmation;
      this.model.site = qr.site;
      this.model.anesthesiaSecurity = qr.anesthesiaSecurity;
      this.model.pulsometer = qr.pulsometer;
      this.model.allergy = qr.allergy;
      this.model.difficultAirway = qr.difficultAirway;
      this.model.riskOfHemorrhage = qr.riskOfHemorrhage;
      this.model.intervention = qr.intervention ?? 'Ninguna';
      this.scannDataForm = true;
      this.showAudioAlert = true;
    } else {
      this.alertService.presentActionAlert(
        '¡Ups! Parece que ocurrió un problema con el QR',
        'Por favor, escanea un código QR valido para continuar.',
        () => {
          this.navCtrl.navigateForward('home');
        }
      );
    }
  }

  private async unsupportedBarcodeMessage() {
    this.alertService.presentBasicAlert(
      '¡Ups!',
      'Parece que tu dispositivo no puede escanear códigos' +
        ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.'
    );
  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      obj = JSON.parse(obj);
      return obj;
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  isValid() {
    let valid = true;
    for (let property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if (this.model[property] === null) {
          valid = false;
        }
      }
    }
    return valid;
  }

  checkDate() {
    this.admissionList.checkDate = new Date();
    this.admissionList.simpleCheckDate = this.transformSimpleDate(
      this.admissionList.checkDate
    );
    this.admissionList.simpleCheckHour = this.transformSimpleHour(
      this.admissionList.checkDate
    );
  }

  changeInterventionDate() {
    this.admissionList.interventionDate = new Date();
    this.admissionList.simpleInterventionDate = this.transformSimpleDate(
      this.admissionList.interventionDate
    );
    this.admissionList.simpleInterventionHour = this.transformSimpleHour(
      this.admissionList.interventionDate
    );
    this.validarOtra(this.model.intervention);
  }

  goToNextPage() {
    this.checkDate();
    const admissionList = this.mapViewToModel();
    console.log('admissionList --> goToNextPage', admissionList);
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        console.log('smsmsmsm', sm);
        sm.admissionList = admissionList;
        sm.state = StatusService.ADMISSION_LIST;
        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            console.log('resultresult', result);
            if (result) {
              this.navCtrl.navigateForward('home');
            }
          })
          .catch(() => console.error('No se pudo guardar el servicio médico'));
      })
      .catch(() => console.log('Error consultando la atencion médica'));
  }

  private mapViewToModel() {
    this.model.arrivalDate = new Date(this.model.arrivalDate);
    this.admissionList.arrivalDate = this.model.arrivalDate;
    this.admissionList.simpleArrivalDate = this.datepipe.transform(
      this.admissionList.arrivalDate,
      'yyyy-MM-dd'
    )!;
    this.admissionList.simpleArrivalHour = this.datepipe.transform(
      this.admissionList.arrivalDate,
      'HH:mm:ss'
    )!;
    this.admissionList.basicConfirmation = this.model.basicConfirmation;
    this.admissionList.site = this.model.site;
    this.admissionList.anesthesiaSecurity = this.model.anesthesiaSecurity;
    this.admissionList.pulsometer = this.model.pulsometer;
    this.admissionList.allergy = this.model.allergy;
    this.admissionList.difficultAirway = this.model.difficultAirway;
    this.admissionList.riskOfHemorrhage = this.model.riskOfHemorrhage;

    if (this.model.intervention === 'Otra') {
      this.admissionList.intervention = this.model.otherIntervention;
    } else {
      this.admissionList.intervention = this.model.intervention;
    }

    this.admissionList.status = StatusService.TERMINADO;
    return this.admissionList;
  }

  validarOtra(intervention: string) {
    if (intervention === 'Otra') {
      this.flagInputOtherIntervention = true;
    } else {
      this.flagInputOtherIntervention = false;
    }
  }

  transformSimpleDate(date: Date) {
    return this.datepipe.transform(date, 'yyyy-MM-dd') ?? '';
  }

  transformSimpleHour(date: Date) {
    return this.datepipe.transform(date, 'HH:mm:ss') ?? '';
  }

  showDemoOptions() {
    const demoQR = {
      basicConfirmation: true,
      site: true,
      anesthesiaSecurity: true,
      pulsometer: true,
      allergy: false,
      difficultAirway: false,
      intervention: 'Ninguna',
      riskOfHemorrhage: false
    };

    this.model.basicConfirmation = demoQR.basicConfirmation;
    this.model.site = demoQR.site;
    this.model.anesthesiaSecurity = demoQR.anesthesiaSecurity;
    this.model.pulsometer = demoQR.pulsometer;
    this.model.allergy = demoQR.allergy;
    this.model.difficultAirway = demoQR.difficultAirway;
    this.model.riskOfHemorrhage = demoQR.riskOfHemorrhage;
    this.model.intervention = demoQR.intervention ?? 'Ninguna';
    this.scannDataForm = true;
    this.showAudioAlert = true;
  }
}
