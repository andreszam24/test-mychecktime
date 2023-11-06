import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

import { MedicalAttention } from 'src/app/models/medical-attention.model';


@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InternetStatusComponent]
})

export class PatientIntakePage implements OnInit {

  medicalAttention: MedicalAttention = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = false;

  constructor(private alertController: AlertController) { }

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async error => {
      this.manualIntake = true;
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }


  async scan(): Promise<void> {
    //(window.document.querySelector('ion-app') as HTMLElement).classList.add('barcode-scanning-active');
    // document.querySelector("body")?.classList.add("barcode-scanning-active");
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      this.manualIntake = true;
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
      if(!this.medicalAttention?.patient){
        this.manualIntake = true;
      }
      console.error(error.message);
    });

    //(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    this.medicalAttention = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    this.manualIntake = false;
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

  public data = [''];


  public results = [...this.data];

  handleInput(event: any) {
    this.results = [];
    const query = event.target.value.toLowerCase();
    if (query != '') {
      this.data = this.patientSearch();
      this.results = this.data.filter((d) => d.toLowerCase().indexOf(query) > -1);
    }
  }

  patientSearch() {
    const cities = [
      'Amsterdam',
      'Buenos Aires',
      'Cairo',
      'Geneva',
      'Hong Kong',
      'Istanbul',
      'London',
      'Madrid',
      'New York',
      'Panama City',
      'Peru',
      'Polonia'
    ];
    return cities;
  }

  private async unsupportedBarcodeMessage() {
    const alert = await this.alertController.create({
      header: '¡Ups!',
      message: 'Parece que tu dispositivo no puede escanear códigos' +
        ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
      buttons: ['OK'],
    });
    await alert.present();
  }
  
  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      return JSON.parse(obj);
    }
    catch (e) {
      this.manualIntake = true;
      console.log(e);
      return {};
    }
  }

}
