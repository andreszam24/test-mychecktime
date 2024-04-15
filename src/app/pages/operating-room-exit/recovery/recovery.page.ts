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


@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.page.html',
  styleUrls: ['./recovery.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent,PreScanQrComponent ]
})
export class RecoveryPage implements OnInit {
  scannDataForm = false;
  barcodes: Barcode[] = [];
  isSupported = false;
  datepipe = new DatePipe('en-US');


  constructor(
    private modalCtrl: ModalController,
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {this.openModal()}

  async openModal() {
    const textoModal = "REALIZAR ESCALAS DE RECUPERACIÓN EN LA UCPA";
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
      this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para y scanea el qr de recuperación!');
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
      if (error.message === 'scan canceled.') {
        this.alertService.presentActionAlert('¡Ups! Parece que cancelaste el escaneo','Por favor, escanea el código QR de recuperación para continuar.', () => {
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
    if(qr){
      console.log('qr escaneado!');
      this.scannDataForm = true;
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



}
