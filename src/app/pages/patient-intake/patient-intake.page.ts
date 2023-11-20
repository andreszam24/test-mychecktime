import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, AlertController, LoadingController } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from '../../models/patient.model';
import { PatientService } from 'src/app/services/patient.service';
import { of, catchError } from 'rxjs';


@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule],
})

export class PatientIntakePage implements OnInit {

  medicalAttention: MedicalAttention | undefined | null = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = false;
  lookingForPatient = false;
  formPatientIntake: FormGroup;
  public data: Patient[] = [];
  public resultsSearchigPatient = [...this.data];


  constructor(
    private alertController: AlertController,
    public fb: FormBuilder,
    private patientsService: PatientService,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.formIntakeValidation();
    this.startBarcodeScanner();
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
      this.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para usar el escáner de códigos!');
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

  handleInputDNIPatient(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 5) {
      this.resultsSearchigPatient = [];
      this.patientSearchByDNI(query);
    }else{
      this.medicalAttention?.setPatient(new Patient());
    }
  }

  patientSelected(patient: Patient) {
    if (this.medicalAttention) {
      this.medicalAttention.patient = patient;
    }
    this.resultsSearchigPatient = [];
    this.changeStatusLookingForPatient(true);
  }

  patientSearchByDNI(dni: string) {
    this.showLoadingBasic("Cargango...");
    this.patientsService.searchByDni(dni).pipe(
      catchError((error) => {
        this.loadingCtrl.dismiss();
        console.error('Ups! Algo salio mal al consultar los pacientes por DNI: ', error);
        return of(null);
      })
    )
      .subscribe((result) => {
        if (result && result.length > 0) {
          this.loadingCtrl.dismiss();
          this.data = result;
          this.resultsSearchigPatient = this.data.filter((patient) => patient.dni.toLowerCase().indexOf(dni) > -1);
        } else {
          let newPatient = new Patient();
          newPatient.dni = dni;
          this.medicalAttention?.setPatient(newPatient);
          this.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
          this.loadingCtrl.dismiss();
        }
      });

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

  async showLoadingWithTimer(message: string, timer: number) {
    const loading = await this.loadingCtrl.create({
      message: message,
      duration: timer,
    });

    loading.present();
  }

  async showLoadingBasic(message: string) {
    const loading = await this.loadingCtrl.create({
      message: message
    });

    loading.present();
  }

  async presentBasicAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

}
