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
    return userData?.id === 870 || userData?.id === 866;
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
    console.log('📱 Iniciando proceso de escaneo en pre-anestesia...');
    
    try {
      // Verificar soporte del dispositivo primero
      const supportResult = await BarcodeScanner.isSupported();
      console.log('🔍 Soporte del dispositivo:', supportResult);
      
      if (!supportResult.supported) {
        console.log('❌ Dispositivo no soporta escaneo de códigos');
        await this.unsupportedBarcodeMessage();
        this.navCtrl.navigateForward('home');
        return;
      }

      const granted = await this.requestPermissions();
      console.log('🔐 Permisos de cámara:', granted);
      
      if (!granted) {
        console.log('❌ Permisos de cámara denegados');
        this.alertService.presentActionAlertCustom(
          '¡Ups! Sin permisos',
          '¡Activa los permisos de la cámara para usar el escáner de códigos!',
          this.handleOpenPermission,
          () => this.navCtrl.navigateForward('home')
        );
        return;
      }

      // Detectar plataforma y usar el método apropiado
      const platform = await import('@capacitor/core').then(m => m.Capacitor.getPlatform());
      console.log('📱 Plataforma detectada:', platform);
      
      if (platform === 'ios') {
        console.log('🍎 iOS detectado, usando escáner nativo...');
        await this.readQR();
      } else {
        // Para Android, verificar el módulo de Google
        console.log('🤖 Android detectado, verificando módulo de Google...');
        await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
          .then(async (data) => {
            console.log('📦 Estado del módulo de Google:', data);
            if (data.available) {
              console.log('✅ Módulo de Google disponible, iniciando escaneo...');
              await this.readQR();
            } else {
              console.log('📥 Instalando módulo de Google...');
              await BarcodeScanner.installGoogleBarcodeScannerModule().then(
                async () => {
                  console.log('✅ Módulo de Google instalado, iniciando escaneo...');
                  await this.readQR();
                }
              );
            }
          })
          .catch((error) => {
            console.error('❌ Error verificando módulo de escaneo:', error);
            this.showAudioAlert = false;
            this.alertService.presentBasicAlert(
              'Error de escaneo',
              'No se pudo inicializar el escáner. Por favor, intenta nuevamente.'
            );
            this.navCtrl.navigateForward('home');
          });
      }
    } catch (error) {
      console.error('💥 Error en scan pre-anestesia:', error);
      this.showAudioAlert = false;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'scan canceled.') {
        this.alertService.presentActionAlert(
          '¡Ups! Parece que cancelaste el escaneo',
          'Por favor, escanea el código QR de area pre-operatoria para continuar.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
      } else if (errorMessage.includes('device') || errorMessage.includes('camera')) {
        this.alertService.presentActionAlert(
          '¡Ups! Parece que hay un problema con tu dispositivo o cámara',
          'Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
      } else {
        console.error('Error inesperado:', errorMessage);
        this.alertService.presentBasicAlert(
          'Error de escaneo',
          'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.'
        );
        this.navCtrl.navigateForward('home');
      }
    }
  }

  private async readQR() {
    try {
      console.log('📷 Iniciando escaneo de QR en pre-anestesia...');
      
      // Configurar opciones de escaneo específicas para iOS
      const scanOptions = {
        formats: ['QR_CODE', 'PDF_417'] as any[],
        // En iOS, no necesitamos configuraciones adicionales
      };
      
      console.log('⚙️ Opciones de escaneo:', scanOptions);
      
      const result = await BarcodeScanner.scan(scanOptions);
      console.log('📊 Resultado del escaneo:', result);
      
      if (!result.barcodes || result.barcodes.length === 0) {
        console.log('❌ No se detectaron códigos en el escaneo');
        this.alertService.presentActionAlert(
          'No se detectó código',
          'No se pudo detectar ningún código QR. Por favor, asegúrate de que el código esté bien visible y vuelve a intentar.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
        return;
      }
      
      const barcode = result.barcodes[0];
      console.log('🔍 Código detectado:', barcode);
      
      let qr = this.parseJSONMedicalAttentionSafely(barcode.displayValue);
      console.log('📋 QR parseado:', qr);
      
      if (qr && qr.basicConfirmation) {
        console.log('✅ QR válido, procesando datos...');
        this.model.basicConfirmation = qr.basicConfirmation;
        this.model.site = qr.site;
        this.model.anesthesiaSecurity = qr.anesthesiaSecurity;
        this.model.pulsometer = qr.pulsometer;
        this.model.allergy = qr.allergy;
        this.model.difficultAirway = qr.difficultAirway;
        this.model.riskOfHemorrhage = qr.riskOfHemorrhage;
        this.model.intervention = qr.intervention ?? 'Ninguna';
        this.scannDataForm = true;
        // Solo mostrar alerta de audio si NO es el usuario 870 o 866
        this.showAudioAlert = !this.idUser;
        console.log('✅ Escaneo completado exitosamente en pre-anestesia');
      } else {
        console.log('❌ QR inválido o sin datos de confirmación básica');
        this.alertService.presentActionAlert(
          '¡Ups! Parece que ocurrió un problema con el QR',
          'Por favor, escanea un código QR válido para continuar.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
      }
    } catch (error) {
      console.error('💥 Error en readQR pre-anestesia:', error);
      
      // Manejar errores específicos
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('camera')) {
        this.alertService.presentBasicAlert(
          'Error de cámara',
          'No se pudo acceder a la cámara. Por favor, verifica los permisos en la configuración del dispositivo.'
        );
      } else if (errorMessage.includes('permission')) {
        this.alertService.presentBasicAlert(
          'Permisos denegados',
          'La aplicación no tiene permisos para usar la cámara. Por favor, habilita los permisos en la configuración.'
        );
      } else {
        this.alertService.presentBasicAlert(
          'Error de escaneo',
          'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.'
        );
      }
      
      this.navCtrl.navigateForward('home');
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
    // Solo mostrar alerta de audio si NO es el usuario 870 o 866
    this.showAudioAlert = !this.idUser;
  }
}
