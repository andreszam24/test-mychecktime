import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InternetStatusComponent]
})
export class PatientIntakePage implements OnInit {
  isSupported = false;
  barcodes: Barcode[] = [];

  constructor(private alertController: AlertController){}

  ngOnInit(){
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    });
  }
  async scan(): Promise<void> {
    (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    const { barcodes } = await BarcodeScanner.scan();
    this.barcodes.push(...barcodes);
    (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Permission denied',
      message: 'Please grant camera permission to use the barcode scanner.',
      buttons: ['OK'],
    });
    await alert.present();
  }

}
