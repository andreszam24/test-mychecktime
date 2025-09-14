import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AlertController,
  IonicModule,
  MenuController,
  ModalController,
} from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import {
  IonDatetime,
  IonDatetimeButton,
  IonModal,
  IonSelectOption,
  IonTextarea,
  NavController,
} from '@ionic/angular/standalone';
import { AudioAlertComponent } from 'src/app/components/audio-alert/audio-alert.component';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { ExitOperatingRoomList } from 'src/app/models/exit-operating-room-list.model';
import { StatusService } from 'src/app/services/status.service';
import { AuthService, USER_KEY } from 'src/app/services/auth.service';

@Component({
  selector: 'app-operating-room-exit-check',
  templateUrl: './operating-room-exit-check.page.html',
  styleUrls: ['./operating-room-exit-check.page.scss'],
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
    AudioAlertComponent,
  ],
})
export class OperatingRoomExitCheckPage implements OnInit {
  audioSrc = './../../../assets/audio/Audio_3.mp3';
  showAudioAlert = false;
  header = 'Validación lista salida quirofano';
  scannDataForm = false;
  alertButtons = [
    {
      text: 'Volver',
      cssClass: 'alert-button-cancel',
      role: 'cancel',
      handler: () => {
        this.navCtrl.navigateForward('home');
      },
    },
  ];
  textValidate =
    'ANTES DE SALIR DEL QUIRÓFANO, INDIQUE AL EQUIPO REVISAR LOS ASPECTOS CRÍTICOS RELACIONADOS CON LA RECUPERACIÓN Y EL TRATAMIENTO DEL PACIENTE. SOLICITE A LA INSTRUMENTADORA CONFIRMAR SI HUBO PROBLEMAS RELACIONADOS CON EL INSTRUMENTAL O EQUIPOS, EL NOMBRE DEL PROCEDIMIENTO REALIZADO, Y EL RECUENTO COMPLETO DE INSTRUMENTOS, GASAS Y AGUJAS. FINALMENTE, ASEGÚRESE DE QUE SE LEA EN VOZ ALTA LA ETIQUETA DE LAS MUESTRAS, VERIFICANDO EL NOMBRE DEL PACIENTE.';
  barcodes: Barcode[] = [];
  isSupported = false;
  datepipe = new DatePipe('en-US');

  exitOperatingRoomList: ExitOperatingRoomList;
  dataUser: any;
  model: any = {
    confirmProcedure: false,
    instrumentsCount: false,
    verifyTagsPatient: false,
    problemsResolve: false,
    recoveryReview: null,
    bloodCount: null,
    bloodCountUnits: 'ml',
  };

  constructor(
    private alertService: AlertService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private modalCtrl: ModalController
  ) {
    this.exitOperatingRoomList = new ExitOperatingRoomList();
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.id === 870 || userData.id === 866;
  }

  ngOnInit() {
    this.openModal();
  }

  async openModal() {
    const textoModal =
      'LISTA DE VERIFICACIÓN ANTES DE SALIR DE LA SALA, VERIFIQUE QUE ESTE PRESENTE LA INSTRUMENTADORA';
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

  private startBarcodeScanner() {
    BarcodeScanner.isSupported()
      .then((result) => {
        this.isSupported = result.supported;
        this.scan();
      })
      .catch(async (error) => {
        console.error(error.message);
        await this.unsupportedBarcodeMessage();
      });
  }

  async scan(): Promise<void> {
    console.log('📱 Iniciando proceso de escaneo en operating-room-exit-check...');
    
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
        this.alertService.presentBasicAlert(
          '¡Ups! Sin permisos',
          '¡Activa los permisos de la cámara para y scanea el qr de salida de quirofano!'
        );
        this.navCtrl.navigateForward('home');
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
      console.error('💥 Error en scan operating-room-exit-check:', error);
      this.showAudioAlert = false;
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'scan canceled.') {
        this.alertService.presentActionAlert(
          '¡Ups! Parece que cancelaste el escaneo',
          'Por favor, escanea el código QR de salida de quirofano para continuar.',
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
      console.log('📷 Iniciando escaneo de QR en operating-room-exit-check...');
      
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
      
      if (qr && qr.confirmProcedure) {
        console.log('✅ QR válido, procesando datos de salida de quirófano...');
        this.model.confirmProcedure = qr.confirmProcedure;
        this.model.instrumentsCount = qr.instrumentsCount;
        this.model.verifyTagsPatient = qr.verifyTagsPatient;
        this.model.problemsResolve = qr.problemsResolve;
        this.model.recoveryReview = qr.recoveryReview;
        this.scannDataForm = true;
        // Solo mostrar alerta de audio si NO es el usuario 870
        this.showAudioAlert = !this.idUser;
        console.log('✅ Escaneo completado exitosamente en operating-room-exit-check');
      } else {
        console.log('❌ QR inválido o sin datos de confirmación de procedimiento');
        this.alertService.presentActionAlert(
          '¡Ups! Parece que ocurrió un problema con el QR',
          'Por favor, escanea un código QR valido para continuar.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
      }
    } catch (error) {
      console.error('💥 Error en readQR operating-room-exit-check:', error);
      
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

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  isValid() {
    let valid = true;
    for (var property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if (this.model[property] === null) {
          valid = false;
        }
      }
    }
    return valid;
  }

  checkDate() {
    this.exitOperatingRoomList.checkDate = new Date();
    this.exitOperatingRoomList.simpleCheckDate = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate,
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleCheckHour = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate,
      'HH:mm:ss'
    )!;
  }

  goToNextPage() {
    const exitOperatingRoomList = this.mapViewToModel();

    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.exitOperatingRoomList = exitOperatingRoomList;
        sm.state = StatusService.EXIT_OPERATING_ROOM_LIST;

        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            if (result) {
              this.navCtrl.navigateForward('exit-menu');
            }
          })
          .catch(() => console.error('No se pudo guardar el servicio médico'));
      })
      .catch(() => console.log('Error consultando la atencion médica'));
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
    this.exitOperatingRoomList.simpleEndProcedureDate = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleEndProcedureHour = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'HH:mm:ss'
    )!;

    return this.exitOperatingRoomList;
  }

  async showConfirmEndProcedure(): Promise<void> {
    const alert = await this.alertController.create({
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
          },
        },
        {
          text: 'SI',
          handler: () => {
            this.checkDate();
            this.goToNextPage();
          },
        },
      ],
    });
    await alert.present();
    return;
  }

  showDemoOptions() {
    const demoQR = {
      confirmProcedure: true,
      instrumentsCount: true,
      verifyTagsPatient: true,
      problemsResolve: true,
      recoveryReview: false
    };

    this.model.confirmProcedure = demoQR.confirmProcedure;
    this.model.instrumentsCount = demoQR.instrumentsCount;
    this.model.verifyTagsPatient = demoQR.verifyTagsPatient;
    this.model.problemsResolve = demoQR.problemsResolve;
    this.model.recoveryReview = demoQR.recoveryReview;
    
    // Si es el usuario 870, establecer bloodCount en 5
    if (this.idUser) {
      this.model.bloodCount = 5;
    }
    
    this.scannDataForm = true;
    // Solo mostrar alerta de audio si NO es el usuario 870
    this.showAudioAlert = !this.idUser;
  }
}
