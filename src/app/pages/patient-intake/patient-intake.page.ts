import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, AlertController, LoadingController } from '@ionic/angular/standalone';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from '../../models/patient.model';
import { PatientService } from 'src/app/services/patient.service';
import { of, catchError } from 'rxjs';
import { Specialty } from 'src/app/models/specialty.model';
import { SpecialtyService } from '../../services/specialty.service';
import { CupsCodes } from 'src/app/models/cups-codes.model';
import { CupsCodesService } from 'src/app/services/cups-codes.service';




@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule, ReactiveFormsModule],
})

export class PatientIntakePage implements OnInit {

  medicalAttention: MedicalAttention | undefined | null = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = false;
  lookingForPatient = false;
  formPatientIntake: FormGroup;
  patientList: Patient[] = [];
  resultsSearchigPatient = [...this.patientList];
  specialtiesList: Specialty[] = [];
  resultsSearchigSpecialties = [...this.specialtiesList];
  cupsCodesList: CupsCodes[] = [];
  resultsSearchigCups = [...this.cupsCodesList];
  searchInputCupsValue: string = '';

  constructor(
    private alertController: AlertController,
    public fb: FormBuilder,
    private patientsService: PatientService,
    private loadingCtrl: LoadingController,
    private specialtyService: SpecialtyService,
    private cupsCodesService: CupsCodesService
  ) { }

  ngOnInit() {
    this.startBarcodeScanner();
    this.loadMasterData();
    this.formIntakeValidation();
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

  loadMasterData() {
    this.getAllCupsCodes();
    this.getAllSpecialties();
  }

  getAllCupsCodes() {
    this.cupsCodesList = this.cupsCodesService.getLocalCups();

    if (this.cupsCodesList.length < 1) {
      this.showLoadingBasic("Cargando...");
      this.cupsCodesService.getRemoteCups()
        .pipe(
          catchError((error) => {
            this.loadingCtrl.dismiss();
            console.error('Ups! Algo salio mal al consultar los cups: ', error);
            this.presentBasicAlert('Oops!', 'Parece algo salio mal consultando los CUPS y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingCtrl.dismiss();
            this.cupsCodesList = result;
          } else {
            this.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de CUPS.');
            this.loadingCtrl.dismiss();
          }
        });
    }
  }

  getAllSpecialties() {

    this.specialtiesList = this.specialtyService.getLocalSpecialties();

    if (this.specialtiesList.length < 1) {
      this.showLoadingBasic("Cargando...");
      this.specialtyService.getRemoteSpecialties()
        .pipe(
          catchError((error) => {
            this.loadingCtrl.dismiss();
            console.error('Ups! Algo salio mal al consultar las especialidades: ', error);
            this.presentBasicAlert('Oops!', 'Parece algo salio mal conusltando las especialidades y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingCtrl.dismiss();
            this.specialtiesList = result;
          } else {
            this.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de especialidades.');
            this.loadingCtrl.dismiss();
          }
        });
    }

  }

  handleInputCupsName(event: any) {
    this.searchInputCupsValue = event.target.value.toLowerCase().trim();
    if (this.searchInputCupsValue != '' && this.searchInputCupsValue.length > 2) {
      this.resultsSearchigCups = [];
      this.searchCupsByName(this.searchInputCupsValue);
    }
  }

  cupsSelected(cup: CupsCodes) {
    if (this.medicalAttention) {
      this.medicalAttention.procedureCodes.push(cup);
      this.searchInputCupsValue = '';
    }
    this.resultsSearchigCups = [];
  }

  unselectCup(cup: CupsCodes) {
    this.medicalAttention?.procedureCodes.splice(this.medicalAttention.procedureCodes.indexOf(cup), 1);
  }

  searchCupsByName(name: string) {
    this.resultsSearchigCups = this.cupsCodesList.filter((cup) => cup.code.toLowerCase().indexOf(name) > -1);
  }

  handleInputDNIPatient(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 5) {
      this.resultsSearchigPatient = [];
      this.patientSearchByDNI(query);
    } else {
      this.medicalAttention?.setPatient(new Patient());
    }
  }

  patientSearchByDNI(dni: string) {
    this.showLoadingBasic("Cargando...");
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
          this.patientList = result;
          this.resultsSearchigPatient = this.patientList.filter((patient) => patient.dni.toLowerCase().indexOf(dni) > -1);
        } else {
          this.medicalAttention = new MedicalAttention();
          let newPatient = new Patient();
          newPatient.dni = dni;
          this.medicalAttention?.setPatient(newPatient);
          this.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
          this.loadingCtrl.dismiss();
        }
      });

  }

  startMedicalAttention() {
    this.formPatientIntake.markAllAsTouched();

    if (this.formPatientIntake.valid && this.medicalAttention && this.medicalAttention?.procedureCodes.length > 0 && this.medicalAttention.specialty) {
      console.log('CONTINUA PROCESO')
    } else {
      this.presentBasicAlert('¡Estas olvidando algo!', 'Es necesario seleccionar una especialidad y al menos un código CUPS');
    }
  }

  patientSelected(patient: Patient) {
    this.medicalAttention = new MedicalAttention();
    if (this.medicalAttention) {
      this.medicalAttention.patient = patient;
    }
    this.resultsSearchigPatient = [];
    this.changeStatusLookingForPatient(true);
  }

  handleInputSpecialtyName(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 4) {
      this.resultsSearchigSpecialties = [];
      this.searchSpecialtyByName(query);
    } else {
      this.medicalAttention?.setSpecialty(new Specialty());
    }
  }

  specialtySelected(specialty: Specialty) {
    if (this.medicalAttention) {
      this.medicalAttention.specialty = specialty;
    }
    this.resultsSearchigSpecialties = [];
  }

  searchSpecialtyByName(name: string) {
    this.resultsSearchigSpecialties = this.specialtiesList.filter((specialty) => specialty.name.toLowerCase().indexOf(name) > -1);
  }

  enableEditMedicalAttentionData() {
    this.changeStatusManulIntake(true);
    this.changeStatusLookingForPatient(true);
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
    console.log('validando')
    this.formPatientIntake = this.fb.group({
      progamationType: new FormControl('', [Validators.required])
    });
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
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
