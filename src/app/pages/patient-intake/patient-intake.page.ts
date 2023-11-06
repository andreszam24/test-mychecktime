import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { User } from 'src/app/models/user.model';


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
  user: User;

  constructor(private alertController: AlertController) { }

  ngOnInit() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    });
  }
  async scan(): Promise<void> {
    //(window.document.querySelector('ion-app') as HTMLElement).classList.add('barcode-scanning-active');
    // document.querySelector("body")?.classList.add("barcode-scanning-active");

    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      return;
    }
    // NOTE: To avoid that scan it doesn't work, you may use 5.0.3 version or higher: npm i @capacitor-mlkit/barcode-scanning@5.0.3
    //Check if the Google ML Kit barcode scanner is available
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then(async (data) => {
      if (data.available) {
        // Start the barcode scanner
        const { barcodes } = await BarcodeScanner.scan();
        this.barcodes.push(...barcodes);
      } else {
        // Install the Google ML Kit barcode scanner
        await BarcodeScanner.installGoogleBarcodeScannerModule().then(async () => {
          const { barcodes } = await BarcodeScanner.scan();
          this.barcodes.push(...barcodes);
        });
      }
    });

    //(window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
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
    if(query != ''){
      this.data = this.patientSearch();
      this.results = this.data.filter((d) => d.toLowerCase().indexOf(query) > -1);
      this.user = new User();
      this.user.name = 'Pepito Perez';
      this.user.lastname = 'Perez';
      this.user.id = 12345;
      this.user.gender = 'Masculino';
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

}
