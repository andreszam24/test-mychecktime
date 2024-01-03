import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonDatetime, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonCardHeader, IonCardContent, IonRow, IonCol, NavController } from '@ionic/angular/standalone';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { WorkingAreaService } from 'src/app/services/working-area.service';
import { AuthService } from 'src/app/services/auth.service';
import { OperationRoom } from 'src/app/models/operationRoom.model';
import { AnesthesiologistProfile } from 'src/app/models/anesthesiologist-profile.model';
import { StatusService } from 'src/app/services/status.service';




@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [IonDatetime, DatePipe, IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule, ReactiveFormsModule, HeaderComponent, IonCardHeader, IonCardContent, IonRow, IonCol],
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
  profileForm = new FormGroup({
    registerCode: new FormControl(''),
    programmingType: new FormControl(''),
    dni: new FormControl(''),
    name: new FormControl(''),
    lastName: new FormControl(''),
    gender: new FormControl(''),
    birthday: new FormControl(''),
  });
  
  datepipe = new DatePipe('en-US');

  constructor(
    private patientsService: PatientService,
    private loadingService: LoadingService,
    private specialtyService: SpecialtyService,
    private cupsCodesService: CupsCodesService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private medicalAttetionRepository: InProgressMedicalAttentionService,
    private workingAreaRepository: WorkingAreaService,
    private authService: AuthService,
    private navCtrl: NavController,
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
    this.medicalAttention.specialty = this.specialtyService.getLocalSpecialtyByName(this.medicalAttention.specialty.name.trim());
    //TODO: hacer que seleccione especialidad o cups sino se encuentran 
    this.setFormPatient();
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
          this.medicalAttention.patient = new Patient();
          this.medicalAttention.patient.dni = dni;
          this.profileForm.patchValue({
            dni: dni,
          });
          this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
          this.loadingService.dismiss();
          this.changeStatusManulIntake(true);
          this.changeStatusLookingForPatient(true);
        }
      });

  }

  toValidateRequiredData(): boolean {
    if (this.medicalAttention && this.medicalAttention.patient?.dni && this.medicalAttention?.procedureCodes.length > 0 && this.medicalAttention.specialty) {
      return true;
    } else {
      return false;
    }
  }

  toValidatePatientData() {
    if (this.toValidateRequiredData()) {
      this.saveMedicalAttention();
    } else {
      this.alertService.presentBasicAlert('¡Estas olvidando algo!', 'Es necesario diligenciar el DNI del paciente, además de seleccionar una especialidad y al menos un código CUPS');
    }
  }

  patientSelected(patient: Patient) {
    this.medicalAttention = new MedicalAttention();
    this.medicalAttention.patient = patient;
    this.setFormPatient();
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
      obj = JSON.parse(obj);
      obj.patient.birthday = this.parseBirthday(obj.patient.birthday);
      return obj;
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

  private saveMedicalAttention(): void {

    if (this.manualIntake) {
      this.medicalAttention.numeroResgistro = this.profileForm.value.registerCode ?? '';
      this.medicalAttention.programming = this.profileForm.value.programmingType ?? '';
      this.medicalAttention.patient.dni = this.profileForm.value.dni ?? '';
      this.medicalAttention.patient.name = this.profileForm.value.name ?? '';
      this.medicalAttention.patient.lastname = this.profileForm.value.lastName ?? '';
      this.medicalAttention.patient.gender = this.profileForm.value.gender ?? '';
      this.medicalAttention.patient.birthday = this.parseBirthday(this.profileForm.value.birthday + '-01-01' ?? '');

    }

    const existePaciente = this.medicalAttetionRepository.existsPatientInProgressAttentions(
      this.workingAreaRepository.getClinic().id,
      this.authService.getLoggedAccount().id,
      this.medicalAttention.patient.dni
    );

    if (existePaciente) {
      this.alertService.presentBasicAlert('¡Con cuidado!', 'El paciente ingresado tiene un servicio médico sin finalizar. Para iniciar un nuevo servicio con este paciente debe terminar el actual.');
      return;
    }

    this.medicalAttention.patient.email = 'dummy@mychecktime.com';
    this.medicalAttention.patient.phone = '12345';
    this.medicalAttention.patient.simpleBirthdayDate = this.datepipe.transform(this.medicalAttention.patient.birthday, 'yyyy-MM-dd') ?? '';
    this.medicalAttention.patient.updated_at = this.datepipe. transform(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ') ?? '';
    this.medicalAttention.patient.created_at = this.datepipe.transform(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ') ?? '';


    this.medicalAttention.idOperatingRoom = -1; //esta variable debería eliminarse
    this.medicalAttention.operatingRoom = new OperationRoom();

    this.medicalAttention.operatingRoom.clinic_id = this.workingAreaRepository.getClinic().id;

    this.medicalAttention.originDate = new Date();
    this.medicalAttention.simpleOriginDate = this.datepipe.transform(this.medicalAttention.originDate, 'yyyy-MM-dd') ?? '';
    this.medicalAttention.simpleOriginHour = this.datepipe.transform(this.medicalAttention.originDate, 'HH:mm:ss') ?? '';

    this.medicalAttention.idClinica = this.workingAreaRepository.getClinic().id;
    this.medicalAttention.currentAnesthesiologist = new AnesthesiologistProfile();
    this.medicalAttention.currentAnesthesiologist.id = this.authService.getLoggedAccount().id;
    this.medicalAttention.currentAnesthesiologist.name = this.authService.getLoggedAccount().name;
    this.medicalAttention.currentAnesthesiologist.lastname = this.authService.getLoggedAccount().lastname;
    this.medicalAttention.currentAnesthesiologist.lastnameS = this.authService.getLoggedAccount().lastnameS;
    this.medicalAttention.currentAnesthesiologist.gender = this.authService.getLoggedAccount().gender;
    this.medicalAttention.currentAnesthesiologist.phone = this.authService.getLoggedAccount().phone;
    this.medicalAttention.currentAnesthesiologist.email = this.authService.getLoggedAccount().email;
    this.medicalAttention.currentAnesthesiologist.status = this.authService.getLoggedAccount().status;
    this.medicalAttention.anestehsiologist = [];
    this.medicalAttention.anestehsiologist.push(this.medicalAttention.currentAnesthesiologist);
    this.medicalAttention.state = StatusService.INICIO;

    this.loadingService.showLoadingBasic('Cargando...');
    this.medicalAttetionRepository.addMedicalAttention(this.medicalAttention).then(
      r => {
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('home');
      }
    ).catch(e => this.loadingService.dismiss());

  }

  setFormPatient() {
    this.profileForm.patchValue({
      registerCode: this.medicalAttention.numeroResgistro,
      programmingType: this.medicalAttention.programming,
      dni: this.medicalAttention.patient.dni,
      name: this.medicalAttention.patient.name,
      lastName: this.medicalAttention.patient.lastname,
      gender: this.medicalAttention.patient.gender,
      birthday: this.getBirthdayYear()
    });
  }

  getBirthdayYear(): string {
    let year = '';
    if (this.medicalAttention && this.medicalAttention.patient.birthday) {
      year = new Date(this.medicalAttention?.patient.birthday.toString()).getFullYear().toString();
    }
    return year;
  }

  private parseBirthday(bday: string): Date {
    const tokens = bday.split('-').map(t => parseInt(t));
    return new Date(tokens[0], tokens[1] - 1, tokens[2]);
  }

}
