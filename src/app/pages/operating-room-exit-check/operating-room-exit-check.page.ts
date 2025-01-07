import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonicModule, MenuController, ModalController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { IonDatetime, IonDatetimeButton, IonModal, IonSelectOption, IonTextarea, NavController} from '@ionic/angular/standalone';
import { AudioAlertComponent } from 'src/app/components/audio-alert/audio-alert.component';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { ExitOperatingRoomList } from 'src/app/models/exit-operating-room-list.model';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-operating-room-exit-check',
  templateUrl: './operating-room-exit-check.page.html',
  styleUrls: ['./operating-room-exit-check.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HeaderComponent, IonSelectOption, DatePipe, IonModal, IonDatetimeButton, IonDatetime, IonTextarea, EventsPanelComponent, PreScanQrComponent, AudioAlertComponent]
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
  textValidate='ANTES DE SALIR DEL QUIRÓFANO, INDIQUE AL EQUIPO REVISAR LOS ASPECTOS CRÍTICOS RELACIONADOS CON LA RECUPERACIÓN Y EL TRATAMIENTO DEL PACIENTE. SOLICITE A LA INSTRUMENTADORA CONFIRMAR SI HUBO PROBLEMAS RELACIONADOS CON EL INSTRUMENTAL O EQUIPOS, EL NOMBRE DEL PROCEDIMIENTO REALIZADO, Y EL RECUENTO COMPLETO DE INSTRUMENTOS, GASAS Y AGUJAS. FINALMENTE, ASEGÚRESE DE QUE SE LEA EN VOZ ALTA LA ETIQUETA DE LAS MUESTRAS, VERIFICANDO EL NOMBRE DEL PACIENTE.';
  barcodes: Barcode[] = [];
  isSupported = false;
  datepipe = new DatePipe('en-US');

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
    private alertService: AlertService,
    private alertController: AlertController,
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private modalCtrl: ModalController,
  ) { 
    this.exitOperatingRoomList = new ExitOperatingRoomList();
  }

  ngOnInit() {
    this.openModal()
  }

  async openModal() {
    const textoModal = "LISTA DE VERIFICACIÓN ANTES DE SALIR DE LA SALA, VERIFIQUE QUE ESTE PRESENTE LA INSTRUMENTADORA";
    const modal = await this.modalCtrl.create({
      component: PreScanQrComponent,
      componentProps: {
        text: textoModal
      }
    });
    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data === 'scan') {
      this.startBarcodeScanner();
    }else{
      this.navCtrl.navigateForward('home');
    }
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
      this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para y scanea el qr de salida de quirofano!');
      this.navCtrl.navigateForward('home');
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
      this.showAudioAlert = false;
      if (error.message === 'scan canceled.') {
        this.alertService.presentActionAlert('¡Ups! Parece que cancelaste el escaneo','Por favor, escanea el código QR de salida de quirofano para continuar.', () => {
          this.navCtrl.navigateForward('home');
        });
    } else if (error.message.includes('device') || error.message.includes('camera')) {
      this.alertService.presentActionAlert( '¡Ups! Parece que hay un problema con tu dispositivo o cámara','Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.',() => {
        this.navCtrl.navigateForward('home');
      });
    } else {
        console.error(error.message);
        this.navCtrl.navigateForward('home');
    }

    });

  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    if(qr && qr.confirmProcedure){
      this.model.confirmProcedure = qr.confirmProcedure;
      this.model.instrumentsCount = qr.instrumentsCount;
      this.model.verifyTagsPatient = qr.verifyTagsPatient;
      this.model.problemsResolve = qr.problemsResolve;
      this.model.recoveryReview = qr.recoveryReview;
      this.scannDataForm = true;
      this.showAudioAlert = true;
    } else{
      this.alertService.presentActionAlert('¡Ups! Parece que ocurrió un problema con el QR','Por favor, escanea un código QR valido para continuar.', () => {
        this.navCtrl.navigateForward('home');
      });
    }
    
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
    this.exitOperatingRoomList.simpleCheckDate = this.datepipe.transform(this.exitOperatingRoomList.checkDate,'yyyy-MM-dd')!;
    this.exitOperatingRoomList.simpleCheckHour = this.datepipe.transform(this.exitOperatingRoomList.checkDate,'HH:mm:ss')!;
  }

  goToNextPage() {

    const exitOperatingRoomList = this.mapViewToModel();

    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.exitOperatingRoomList = exitOperatingRoomList;
      sm.state = StatusService.EXIT_OPERATING_ROOM_LIST;

      this.medicalService.saveMedicalAttention(sm,'sync')
        .then(result => {
            if(result) {
              this.navCtrl.navigateForward('exit-menu');
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
    this.exitOperatingRoomList.simpleEndProcedureDate = this.datepipe.transform(this.exitOperatingRoomList.endProcedureDate,'yyyy-MM-dd')!;
    this.exitOperatingRoomList.simpleEndProcedureHour = this.datepipe.transform(this.exitOperatingRoomList.endProcedureDate,'HH:mm:ss')!;
    
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
    await alert.present();
    return;
  }

}
