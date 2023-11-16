import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, AlertController } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from '../../models/patient.model';


@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule],
})

export class PatientIntakePage implements OnInit {
  //TODO: Borrar dummyMA = '{"patient":{"name":"Pepito","lastname":"Perez","birthday":"1922-09-19","gender":"masculino","dni":"192832"},"specialty":{"name":"CIRUGÍA GENERAL"},"procedureCodes":[{"code":"1252","name":"rodillameniscos"},{"code":"1312","name":"rodillaligamento"}],"numeroResgistro":"DE123","programming":"urgencia externa","asa":"IV"}';
  medicalAttention: MedicalAttention | undefined | null = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = false;
  lookingForPatient = false;
  formPatientIntake: FormGroup;


  constructor(private alertController: AlertController, public fb: FormBuilder) { }

  ngOnInit() {
    this.formIntakeValidation();
    this.startBarcodeScanner();
    //TODO: Borrar this.medicalAttention = this.parseJSONMedicalAttentionSafely(this.dummyMA);
    // console.log(this.medicalAttention?.patient.birthday.toString().replace(/T.*/,'').split('-').reverse().join('-'));
  }


  private startBarcodeScanner() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async (error) => {
      this.changeStatusManulIntake(true);
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.presentAlert();
      this.changeStatusManulIntake(true);
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
      if (!this.medicalAttention?.patient) {
        this.changeStatusManulIntake(true);
      }
      console.error(error.message);
    });

  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    this.medicalAttention = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    this.changeStatusManulIntake(false);
    this.changeStatusLookingForPatient(false);
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  async presentAlert(): Promise<void> {
    const alert = await this.alertController.create({
      header: '¡Ups! Sin permisos',
      message: '¡Activa los permisos de la cámara para usar el escáner de códigos!',
      buttons: ['OK']
    });
    await alert.present();
  }

  public data: Patient[] = [];
  public resultsSearchigPatient = [...this.data];

  handleInputDNIPatient(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 5) {
      this.resultsSearchigPatient = [];
      this.data = this.patientSearchByDNI();
      this.resultsSearchigPatient = this.data.filter((patient) => patient.name.toLowerCase().indexOf(query) > -1);
    }
  }

  patientSelected(patient: Patient){
    console.log(patient);
    this.resultsSearchigPatient = [];
    this.changeStatusLookingForPatient(true);
  }

  patientSearchByDNI() {
    const patients: Patient[] = [];
    /*this.patientsService.searchByDni(text)
      .subscribe(p => {
        event.component.items = p as any;
        event.component.isSearching = false;
      },_ => {
        event.component.isSearching = false;
      }
    );*/

    return patients;
  }

  enableEditMedicalAttentionData() {
    this.changeStatusManulIntake(true);
  }

  changeStatusManulIntake(newState: boolean) {
    this.manualIntake = newState;
  }

  changeStatusLookingForPatient(newState: boolean) {
    this.lookingForPatient = newState;
  }

  private async unsupportedBarcodeMessage() {
    const alert = await this.alertController.create({
      header: '¡Ups!',
      message: 'Parece que tu dispositivo no puede escanear códigos' +
        ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
      buttons: ['OK']
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

  private formIntakeValidation() {
    this.formPatientIntake = this.fb.group({
      user: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]{3,}')])
    });
  }

}
