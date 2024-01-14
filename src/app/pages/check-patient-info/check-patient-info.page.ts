import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { Patient } from 'src/app/models/patient.model';


@Component({
  selector: 'app-check-patient-info',
  templateUrl: './check-patient-info.page.html',
  styleUrls: ['./check-patient-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class CheckPatientInfoPage implements OnInit {

  barcodes: Barcode[] = [];
  textItem: string = 'Da click en la imagen para escanea la manilla del paciente o ingresa los ultimos 4 digitos de su identificacion  y oprime continuar';
  isSupported = false;
  validPerson: Patient;
  inputData:string = '';
  medicalServiceInProgressDataPatient:Patient;



  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
  ) { }

  ngOnInit() {
    this.medicalServiceInProgress();
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

  private async unsupportedBarcodeMessage() {
    this.textItem = '¡Ups! Parece que tu dispositivo no puede escanear códigos con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.';
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.textItem = '¡Ups! Sin permisos ¡Activa los permisos de la cámara para usar el escáner de códigos o ingresa los ultimos 4 digitos de su identificacion  y oprime continuar';
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
        this.textItem = '¡Ups! Parece que cancelaste el escaneo. Por favor, escanea el código QR para verificar identidad del paciente o ingresa los ultimos 4 digitos de su identificacion  y oprime continuar.';
    } else if (error.message.includes('device') || error.message.includes('camera')) {
        this.textItem = '¡Ups! Parece que hay un problema con tu dispositivo o cámara. Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.';
    } else {
        console.error(error.message);
        this.textItem = error.message;
    }
    });

  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    if(qr && qr.patient){
      this.validPerson = qr.patient;
      this.verifyDataPatient(); 
    } else {
      console.log(qr)
      throw new Error('¡Ups! Parece que ocurrió un problema con el QR, ingresa los ultimos 4 digitos de su identificacion  y oprime continuar');     
    }
  }

  medicalServiceInProgress(){
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      this.medicalServiceInProgressDataPatient = sm.patient;
    }).catch(() => console.log('Error consultando la atencion médica'));
  }

  verifyDataPatient(){
    if(this.doesMatch()){
      console.log('match')
      //this.goToNextPage();
    } else {
      throw new Error('¡Ups! Parece que ocurrió un problema, el contenido del código QR no corresponde al paciente, verifica la identidad antes de continuar');     
    }
  }

  doesMatch(): boolean {
    if (this.medicalServiceInProgressDataPatient.dni === this.validPerson.dni && this.medicalServiceInProgressDataPatient.name === this.validPerson.name && this.medicalServiceInProgressDataPatient.lastname === this.validPerson.lastname) {
      return true;
  } else {
      return false;
  }}

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

  goToNextPage(){
    this.navCtrl.navigateForward('operating-room-list');
  }

  goToBackPage(){
    this.navCtrl.back()
  }

  toContinue() {
    if (this.inputData.trim() === '') {
      this.textItem = '¡Ups! Debe ingresar un valor manual o dar click en la imagen para escanear el codigo QR y validar identidad del paciente';
    } else {
      let patientDni = this.medicalServiceInProgressDataPatient.dni.slice(-4);
      console.log(patientDni)
      if(patientDni === this.inputData){
        console.log(patientDni, '=', this.inputData)
        //this.goToBackPage();
      } else{
        this.textItem = 'los ultimos 4 digitos no coinciden con el paciente programado, debes validar identidad del paciente';
      }     
    }
  }

  
    

}
