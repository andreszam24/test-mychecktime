import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonCardHeader, IonCardContent, IonRow, IonCol } from '@ionic/angular/standalone';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { HeaderComponent } from '../../components/header/header.component';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from '../../models/patient.model';
import { PatientService } from 'src/app/services/patient.service';
import { of, catchError } from 'rxjs';
import { Specialty } from 'src/app/models/specialty.model';
import { SpecialtyService } from '../../services/specialty.service';
import { CupsCodes } from 'src/app/models/cups-codes.model';
import { CupsCodesService } from 'src/app/services/cups-codes.service';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';




@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule, ReactiveFormsModule, HeaderComponent, IonCardHeader, IonCardContent, IonRow, IonCol],
})

export class PatientIntakePage implements OnInit {

  medicalAttention: MedicalAttention = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = false;
  lookingForPatient = false;
  patientList: Patient[] = [];
  resultsSearchigPatient = [...this.patientList];
  specialtiesList: Specialty[] = [];
  resultsSearchigSpecialties = [...this.specialtiesList];
  cupsCodesList: CupsCodes[] = [];
  resultsSearchigCups = [...this.cupsCodesList];
  searchInputCupsValue: string = '';

  constructor(
    private patientsService: PatientService,
    private loadingService: LoadingService,
    private specialtyService: SpecialtyService,
    private cupsCodesService: CupsCodesService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.startBarcodeScanner();
    this.loadMasterData();
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
      this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para usar el escáner de códigos!');
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
    this.cdr.detectChanges();
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
      this.loadingService.showLoadingBasic("Cargando...");
      this.cupsCodesService.getRemoteCups()
        .pipe(
          catchError((error) => {
            this.loadingService.dismiss();
            console.error('Ups! Algo salio mal al consultar los cups: ', error);
            this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal consultando los CUPS y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingService.dismiss();
            this.cupsCodesList = result;
          } else {
            this.alertService.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de CUPS.');
            this.loadingService.dismiss();
          }
        });
    }
  }

  getAllSpecialties() {

    this.specialtiesList = this.specialtyService.getLocalSpecialties();

    if (this.specialtiesList.length < 1) {
      this.loadingService.showLoadingBasic("Cargando...");
      this.specialtyService.getRemoteSpecialties()
        .pipe(
          catchError((error) => {
            this.loadingService.dismiss();
            console.error('Ups! Algo salio mal al consultar las especialidades: ', error);
            this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal conusltando las especialidades y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingService.dismiss();
            this.specialtiesList = result;
          } else {
            this.alertService.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de especialidades.');
            this.loadingService.dismiss();
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
      this.medicalAttention.patient = new Patient();
    }
  }

  patientSearchByDNI(dni: string) {
    this.loadingService.showLoadingBasic("Cargando...");
    this.patientsService.searchByDni(dni).pipe(
      catchError((error) => {
        this.loadingService.dismiss();
        console.error('Ups! Algo salio mal al consultar los pacientes por DNI: ', error);
        return of(null);
      })
    )
      .subscribe((result) => {
        if (result && result.length > 0) {
          this.loadingService.dismiss();
          this.patientList = result;
          this.resultsSearchigPatient = this.patientList.filter((patient) => patient.dni.toLowerCase().indexOf(dni) > -1);
        } else {
          this.medicalAttention = new MedicalAttention();
          let newPatient = new Patient();
          newPatient.dni = dni;
          this.medicalAttention?.setPatient(newPatient);
          this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
          this.loadingService.dismiss();
        }
      });

  }

  toValidateRequiredData(): boolean {
    if (this.medicalAttention && this.medicalAttention.patient.dni && this.medicalAttention?.procedureCodes.length > 0 && this.medicalAttention.specialty) {
      return true;
    } else {
      return false;
    }
  }

  toValidatePatientData(type: string) {

    if (this.toValidateRequiredData()) {
      if (type == 'qr') {
        this.saveMedicalAttention();
      } else {
        this.createPatient();
      }
    } else {
      this.alertService.presentBasicAlert('¡Estas olvidando algo!', 'Es necesario diligenciar el DNI del paciente, además de seleccionar una especialidad y al menos un código CUPS');
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
      this.medicalAttention.specialty = new Specialty();
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
    this.alertService.presentBasicAlert('¡Ups!',
      'Parece que tu dispositivo no puede escanear códigos' +
      ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
    );
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

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  createPatient(): void {
    const patient = new Patient();
    /*patient.name = this.formPatientIntake.value.name;
    patient.lastname = this.formPatientIntake.value.lastname;
    patient.dni = this.formPatientIntake.value.dni;
    patient.birthday = new Date(this.formPatientIntake.value.birthday);
    // this.realBirthday = this.parseBirthday(this.formPatientIntake.value.birthday);
    patient.gender = this.formPatientIntake.value.gender;*/
    // patient.birthday = this.parseBirthday(this.formPatientIntake.value.birthday);
    //patient.phone = this.patientForm.value.phone;
    // patient.email = this.patientForm.value.email;
    this.medicalAttention.patient = patient;
    console.log('crenado paciente');
    this.saveMedicalAttention();
  }

  private saveMedicalAttention(): void {

    console.log('escaneado: ', this.medicalAttention)
    /*const existePaciente = this.medicalAttetionRepository.existsPatientInProgressAttentions(
        this.workingAreaRepository.getClinic().id,
        this.authService.getLoggedAccount().id,
        paciente.dni
      );
    
    if(existePaciente) {
      this.showInformationalModal(`El paciente ingresado tiene un servicio médico sin finalizar. Para iniciar un nuevo servicio con este paciente debe terminar el actual.`);
      return;
    }
    
    paciente.birthday = this.realBirthday;
    paciente.simpleBirthdayDate = this.datepipe.transform(this.patientForm.value.birthday,'yyyy-MM-dd');
    paciente.updated_at = this.datepipe.transform(paciente.updated_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ');
    paciente.created_at = this.datepipe.transform(paciente.created_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ');
    if (this.medicalAttentionForm.dirty && this.medicalAttentionForm.valid) {
      const m = new MedicalAttention();
      m.idOperatingRoom = -1; //esta variable debería eliminarse
      m.operatingRoom = new OperationRoom();
      
      m.operatingRoom.clinic_id = this.workingAreaRepository.getClinic().id;
      

      m.specialty = this.especialidadSeleccionada;
      m.numeroResgistro = this.medicalAttentionForm.value.registro;

      m.programming = this.medicalAttentionForm.value.programming;
      m.asa = this.medicalAttentionForm.value.asa;
      m.procedureCodes  = this.cupsSeleccionados;

      m.originDate = new Date();
      m.simpleOriginDate = this.datepipe.transform(m.originDate,'yyyy-MM-dd');
      m.simpleOriginHour = this.datepipe.transform(m.originDate,'HH:mm:ss');
      
      m.idClinica = this.workingAreaRepository.getClinic().id;
      m.currentAnesthesiologist = new AnesthesiologistProfile();
      m.currentAnesthesiologist.id = this.authService.getLoggedAccount().id;
      m.currentAnesthesiologist.name = this.authService.getLoggedAccount().name;
      m.currentAnesthesiologist.lastname = this.authService.getLoggedAccount().lastname;
      m.currentAnesthesiologist.lastnameS = this.authService.getLoggedAccount().lastnameS;
      m.currentAnesthesiologist.gender = this.authService.getLoggedAccount().gender;
      m.currentAnesthesiologist.phone = this.authService.getLoggedAccount().phone;
      m.currentAnesthesiologist.email = this.authService.getLoggedAccount().email;
      m.currentAnesthesiologist.status = this.authService.getLoggedAccount().status;
      m.anestehsiologist = [];
      m.anestehsiologist.push(m.currentAnesthesiologist);

      m.patient = paciente;
      m.state = StatusService.INICIO;
      
      const loading = this.showLoading();
      this.medicalAttetionRepository.addMedicalAttention(m).then(
          r => {
            loading.dismiss();
            this.syncPacientesPendientesDelAreaDeTrabajo();
          }
        ).catch(e => loading.dismiss() );
    }*/
  }

  getBirthdayYear(): string {
    let year = '';
    if (this.medicalAttention && this.medicalAttention.patient.birthday) {
      year = new Date(this.medicalAttention?.patient.birthday.toString()).getFullYear().toString();
    }
    return year;
  }

}
