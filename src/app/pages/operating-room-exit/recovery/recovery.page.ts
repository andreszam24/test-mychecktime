import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { Recover } from 'src/app/models/recover.model';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { StatusService } from 'src/app/services/status.service';
import { FromOperatingRoomTo } from 'src/app/models/from-operating-room-to.model';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { InternetStatusComponent } from '../../../components/internet-status/internet-status.component';
import { USER_KEY } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.page.html',
  styleUrls: ['./recovery.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventsPanelComponent,
    PreScanQrComponent,
    ButtonPanelComponent,
    DatePipe,
    InternetStatusComponent,
  ],
})
export class RecoveryPage implements OnInit {
  scannDataForm = false;
  barcodes: Barcode[] = [];
  isSupported = false;
  datepipe = new DatePipe('en-US');
  dataUser: any;
  recover: Recover;

  model: any = {
    aldrete: null,
    bromage: null,
    ramsay: null,
    eva: null,
    nausea: null,
  };

  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
    private alertService: AlertService
  ) {
    this.recover = new Recover();
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.id === 870;
  }

  ngOnInit() {
    this.openModal();
  }

  // initializeModel() {
  //   if (this.idRole) {
  //     this.model = {
  //       aldrete: '-1',
  //       bromage: '-1',
  //       ramsay: '-1',
  //       eva: 0,
  //       nausea: false
  //     }
  //   }
  // }

  // get idRole(): boolean {
  //   const userData = JSON.parse(this.dataUser);
  //   return userData?.roles?.[0]?.id === 4;
  // }

  async openModal() {
    const textoModal = 'REALIZAR ESCALAS DE RECUPERACIÓN EN LA UCPA';
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
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertService.presentBasicAlert(
        '¡Ups! Sin permisos',
        '¡Activa los permisos de la cámara para y scanea el qr de recuperación!'
      );
      this.navCtrl.navigateForward('home');
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
        if (error.message === 'scan canceled.') {
          this.alertService.presentActionAlert(
            '¡Ups! Parece que cancelaste el escaneo',
            'Por favor, escanea el código QR de recuperación para continuar.',
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
    console.log('qrqrqrqr', qr);
    if (qr && qr.onlyRecovery) {
      this.model.aldrete = qr.aldrete;
      this.model.bromage = qr.bromage;
      this.model.ramsay = qr.ramsay;
      this.model.eva = qr.eva;
      this.model.nausea = qr.nausea;
      this.scannDataForm = true;
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

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  isValid() {
    const oneOfThree =
      this.isSetted(this.model.bromage) ||
      this.isSetted(this.model.ramsay) ||
      this.isSetted(this.model.aldrete);
    return (
      this.isSetted(this.model.eva) && oneOfThree && this.model.nausea !== null
    );
  }

  private isSetted(valor: any) {
    return valor !== undefined && valor !== null && valor !== '';
  }

  checkDate() {
    this.recover.checkDate = new Date();
    this.recover.simpleCheckDateOrder = this.datepipe.transform(
      this.recover.checkDate,
      'yyyy-MM-dd'
    )!;
    this.recover.simpleCheckHourOrder = this.datepipe.transform(
      this.recover.checkDate,
      'HH:mm:ss'
    )!;
  }

  async goToNextPage() {
    await this.loadingService.showLoadingBasic('Cargando...');
    this.checkDate();
    this.mapViewToModel();
    const fromRoomTo = new FromOperatingRoomTo();
    fromRoomTo.status = StatusService.TERMINADO;
    fromRoomTo.to = 'recuperacion';
    fromRoomTo.checkDate = this.recover.checkDate || new Date();
    fromRoomTo.simpleCheckDate = this.datepipe.transform(
      fromRoomTo.checkDate || new Date(),
      'yyyy-MM-dd'
    )!;
    fromRoomTo.simpleCheckHour = this.datepipe.transform(
      fromRoomTo.checkDate || new Date(),
      'HH:mm:ss'
    )!;
    fromRoomTo.recover = this.recover;
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.exitOperatingRoomList.fromOperatingRoomTo = fromRoomTo;
        sm.state = StatusService.FROM_OPERATING_ROOM_TO;
        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            this.loadingService.dismiss();
            if (result) {
              this.navCtrl.navigateForward('/home');
            }
          })
          .catch(() => {
            this.loadingService.dismiss();
            this.navCtrl.navigateForward('/home');
          });
      })
      .catch(() => {
        console.error('Error consultando la atencion médica');
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('/home');
      });
  }

  private mapViewToModel(): Recover {
    this.recover.aldrete = this.valorNumerico(this.model.aldrete);
    this.recover.bromage = this.valorNumerico(this.model.bromage);
    this.recover.ramsay = this.valorNumerico(this.model.ramsay);
    this.recover.eva = this.model.eva;
    this.recover.nausea = this.model.nausea;
    this.recover.state = StatusService.TERMINADO;
    return this.recover;
  }

  private valorNumerico(valor: any): number {
    return valor === '' ? null : valor;
  }

  showDemoOptions() {
    const demoQR = {
      onlyRecovery: true,
      aldrete: '-1',
      bromage: '-1',
      ramsay: '-1',
      eva: 0,
      nausea: false
    };

    // Simular el mismo proceso que readQR()
    this.model.aldrete = demoQR.aldrete;
    this.model.bromage = demoQR.bromage;
    this.model.ramsay = demoQR.ramsay;
    this.model.eva = demoQR.eva;
    this.model.nausea = demoQR.nausea;
    this.scannDataForm = true;
  }
}
