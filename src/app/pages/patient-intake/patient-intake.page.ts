import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  IonItem,
  IonSearchbar,
  IonAvatar,
  IonLabel,
  IonText,
  IonInput,
  IonIcon,
  IonSelect,
  IonCardHeader,
  IonCardContent,
  IonRow,
  IonCol,
  NavController,
} from '@ionic/angular/standalone';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';

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
import { AuthService, USER_KEY } from 'src/app/services/auth.service';
import { OperationRoom } from 'src/app/models/operationRoom.model';
import { AnesthesiologistProfile } from 'src/app/models/anesthesiologist-profile.model';
import { StatusService } from 'src/app/services/status.service';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';

@Component({
  selector: 'app-patient-intake',
  templateUrl: './patient-intake.page.html',
  styleUrls: ['./patient-intake.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonSearchbar,
    IonAvatar,
    IonLabel,
    IonText,
    IonInput,
    IonIcon,
    IonSelect,
    IonicModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    IonCardHeader,
    IonCardContent,
    IonRow,
    IonCol,
    ButtonPanelComponent,
  ],
})
export class PatientIntakePage implements OnInit, OnDestroy {
  medicalAttention: MedicalAttention = new MedicalAttention();
  barcodes: Barcode[] = [];
  isSupported = false;
  manualIntake = true;
  lookingForPatient = false;
  cameraPermissionRequested = false;
  patientList: Patient[] = [];
  patientToRebootProcess = new Patient();
  resultsSearchigPatient = [...this.patientList];
  specialtiesList: Specialty[] = [];
  resultsSearchigSpecialties = [...this.specialtiesList];
  cupsCodesList: CupsCodes[] = [];
  resultsSearchigCups = [...this.cupsCodesList];
  searchInputCupsValue: string = '';
  currentYear = new Date().getFullYear();
  invalidYear: boolean = false;
  profileForm = new FormGroup({
    registerCode: new FormControl('1111'),
    programmingType: new FormControl(''),
    dni: new FormControl(''),
    name: new FormControl(''),
    lastName: new FormControl(''),
    gender: new FormControl(''),
    birthday: new FormControl(''),
  });
  dataUser: any;
  datepipe = new DatePipe('en-US');
  medicalAttentionsResponse: any;

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
    private sharedDataService: SharedDataService,
    private navCtrl: NavController
  ) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.getpatientToRebootProcess();
    this.loadMasterData();
    this.initializeModel();
  }

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData.id === 870 || userData.id === 866;
  }
  initializeModel() {
    if (this.idUser) {
      const specialty = this.specialtiesList.find(specialty => specialty.id === 3);
      if (specialty) {
        this.medicalAttention.specialty = specialty;
      }
      const cup = this.cupsCodesList.find(cup => cup.id === 1);
      if (cup) {
        this.medicalAttention.procedureCodes = [cup];
      }
    }
  }

  ngOnDestroy() {
    this.cameraPermissionRequested = false;
    this.isSupported = false;

    try {
      this.loadingService.dismiss();
    } catch (error) {
      console.error('Error dismissing loading on destroy:', error);
    }
  }

  get idClinic() {
    const userData = JSON.parse(this.dataUser);
    return userData.clinics[0].id;
  }

  getpatientToRebootProcess() {
    this.patientToRebootProcess = this.sharedDataService.getDatos();
    if (!this.patientToRebootProcess) {
      this.startBarcodeScanner();
    } else {
      this.patientSelected(this.patientToRebootProcess);
      this.changeStatusManulIntake(true);
    }
  }

  async startBarcodeScanner() {
    try {
      const result = await BarcodeScanner.isSupported();
      this.isSupported = result.supported;

      if (!this.isSupported) {
        setTimeout(async () => {
          await this.unsupportedBarcodeMessage();
        }, 100);
        this.changeStatusManulIntake(true);
      }
    } catch (error) {
      console.error('startBarcodeScanner error:', error);
      this.changeStatusManulIntake(true);

      setTimeout(async () => {
        await this.unsupportedBarcodeMessage();
      }, 100);
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.checkPermissions();
      const isGranted = camera === 'granted' || camera === 'limited';
      return isGranted;
    } catch (error) {
      console.error('Error verificando permisos:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { camera } = await BarcodeScanner.requestPermissions();
      const isGranted = camera === 'granted' || camera === 'limited';
      return isGranted;
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  async ensureCameraPermissions(): Promise<boolean> {
    try {
      let granted = await this.checkPermissions();
      
      if (!granted) {
        granted = await this.requestPermissions();
        
        if (!granted) {
          await this.showCameraPermissionAlert();
          return false;
        }
      }
      
      return granted;
    } catch (error) {
      console.error('Error asegurando permisos de cámara:', error);
      return false;
    }
  }

  handleOpenPermission = async () => {
    try {
      await NativeSettings.open({
        optionAndroid: AndroidSettings.ApplicationDetails,
        optionIOS: IOSSettings.App,
      });
      
      // El usuario debe regresar manualmente a la app después de configurar permisos
      // No necesitamos verificar automáticamente, el usuario puede intentar escanear nuevamente
      this.cameraPermissionRequested = false;
      this.changeStatusManulIntake(true);
    } catch (error) {
      console.error('Error abriendo configuraciones:', error);
      this.cameraPermissionRequested = false;
      this.changeStatusManulIntake(true);
    }
  };

  private async attemptScan(): Promise<void> {
    try {
      await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
        .then(async (data) => {
          if (data.available) {
            await this.readQR();
          } else {
            await BarcodeScanner.installGoogleBarcodeScannerModule().then(
              async () => {
                await this.readQR();
              }
            );
          }
        })
        .catch((error) => {
          console.error('Error verificando módulo de escaneo:', error);
          this.cameraPermissionRequested = false;
          if (!this.medicalAttention?.patient) {
            this.changeStatusManulIntake(true);
          }
        });
    } catch (error) {
      console.error('Error en attemptScan:', error);
      this.cameraPermissionRequested = false;
      this.changeStatusManulIntake(true);
    }
  }

  async scan(): Promise<void> {
    if (this.cameraPermissionRequested) {
      return;
    }

    this.cameraPermissionRequested = true;

    try {
      const granted = await this.ensureCameraPermissions();
      
      if (granted) {
        await this.attemptScan();
      }
    } catch (error) {
      console.error('Error en scan:', error);
      this.changeStatusManulIntake(true);
    } finally {
      this.cameraPermissionRequested = false;
    }
  }

  private async showCameraPermissionAlert(): Promise<void> {
    try {
      await this.alertService.presentActionAlertCustom(
        '¡Ups! Sin permisos',
        '¡Activa los permisos de la cámara para usar el escáner de códigos!',
        this.handleOpenPermission,
        () => {
          this.cameraPermissionRequested = false;
          this.changeStatusManulIntake(true);
        },
        'Configurar'
      );
    } catch (error) {
      console.error('Error mostrando alert de permisos:', error);
      this.cameraPermissionRequested = false;
      this.changeStatusManulIntake(true);
    }
  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    
    if (qr && qr.patient) {
      const isSamePatient = this.medicalAttention.patient?.dni === qr.patient.dni;
      
      if (isSamePatient && this.medicalAttention.patient?.dni) {
        const newCupsCode = qr.procedureCodes?.[0]?.code;
        const existingCupsCodes = this.medicalAttention.procedureCodes?.map(cup => cup.code) || [];
        
        if (newCupsCode && !existingCupsCodes.includes(newCupsCode)) {
          this.medicalAttention.procedureCodes = [
            ...this.medicalAttention.procedureCodes,
            ...qr.procedureCodes
          ];
          
          this.alertService.presentBasicAlert(
            'CUPS agregado',
            `Se agregó el código CUPS ${newCupsCode} al paciente ${qr.patient.name} ${qr.patient.lastname}`
          );
        } else if (newCupsCode && existingCupsCodes.includes(newCupsCode)) {
          this.alertService.presentBasicAlert(
            'CUPS duplicado',
            `El código CUPS ${newCupsCode} ya está registrado para este paciente`
          );
        }
      } else {
        this.medicalAttention.patient = qr.patient;
        this.medicalAttention.specialty = qr.specialty;
        this.medicalAttention.procedureCodes = qr.procedureCodes || [];
        this.medicalAttention.programming = qr.programming;
        this.medicalAttention.numeroResgistro = qr.register;
        
        this.profileForm.patchValue({
          registerCode: qr.register,
          programmingType: qr.programming,
          dni: qr.patient.dni,
          name: qr.patient.name,
          lastName: qr.patient.lastname,
          gender: qr.patient.gender,
          birthday: this.getBirthdayYearFromDate(qr.patient.birthday)
        });
        
        this.changeStatusManulIntake(true);
        this.changeStatusLookingForPatient(true);
      }
      
      this.cameraPermissionRequested = false;
    } else {
      this.alertService.presentActionAlert(
        '¡Ups! Parece que ocurrió un problema con el QR',
        'Por favor, escanea un código QR valido para continuar.',
        () => {
          this.changeStatusManulIntake(true);
        }
      );
    }
  }

  loadMasterData() {
    this.getAllCupsCodes();
    this.getAllSpecialties();
  }

  getAllCupsCodes() {
    this.cupsCodesList = this.cupsCodesService.getLocalCups();
    console.log('🏥 Códigos CUPS cargados localmente:', this.cupsCodesList);

    if (this.cupsCodesList.length < 1) {
      this.loadingService.showLoadingBasic('Cargando...');
      this.cupsCodesService
        .getRemoteCups()
        .pipe(
          catchError((error) => {
            this.loadingService.dismiss();
            console.error('Ups! Algo salio mal al consultar los cups: ', error);
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece algo salio mal consultando los CUPS y no logramos conectar con el servidor'
            );
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingService.dismiss();
            this.cupsCodesList = result;
            console.log('🌐 Códigos CUPS cargados desde el servidor:', this.cupsCodesList);
            console.log('📊 Detalle de códigos CUPS del servidor:');
            this.cupsCodesList.forEach((cup, index) => {
              console.log(`  ${index + 1}. Código: ${cup.code}, Nombre: ${cup.name}`);
            });
          } else {
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece que el servidor no tiene data de CUPS.'
            );
            this.loadingService.dismiss();
          }
        });
    }
  }

  getAllSpecialties() {
    this.specialtiesList = this.specialtyService.getLocalSpecialties();
    console.log('🏥 Especialidades cargadas localmente:', this.specialtiesList);

    if (this.specialtiesList.length < 1) {
      this.loadingService.showLoadingBasic('Cargando...');
      this.specialtyService
        .getRemoteSpecialties()
        .pipe(
          catchError((error) => {
            this.loadingService.dismiss();
            console.error(
              'Ups! Algo salio mal al consultar las especialidades: ',
              error
            );
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece algo salio mal conusltando las especialidades y no logramos conectar con el servidor'
            );
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result && result.length > 0) {
            this.loadingService.dismiss();
            this.specialtiesList = result;
            console.log('🌐 Especialidades cargadas desde el servidor:', this.specialtiesList);
            console.log('📊 Detalle de especialidades del servidor:');
            this.specialtiesList.forEach((specialty, index) => {
              console.log(`  ${index + 1}. ID: ${specialty.id}, Nombre: ${specialty.name}`);
            });
          } else {
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece que el servidor no tiene data de especialidades.'
            );
            this.loadingService.dismiss();
          }
        });
    }
  }

  handleInputCupsName(event: any) {
    this.searchInputCupsValue = event.target.value.toLowerCase().trim();
    console.log('🔍 Búsqueda de código CUPS:', this.searchInputCupsValue);
    console.log('📋 Lista completa de códigos CUPS:', this.cupsCodesList);
    
    if (
      this.searchInputCupsValue != '' &&
      this.searchInputCupsValue.length > 2
    ) {
      this.resultsSearchigCups = [];
      this.searchCupsByName(this.searchInputCupsValue);
    }
  }

  cupsSelected(cup: CupsCodes) {
    console.log('✅ Código CUPS seleccionado:', cup);
    console.log('🔢 Código CUPS seleccionado:', cup.code);
    console.log('📝 Nombre CUPS seleccionado:', cup.name);
    
    if (this.medicalAttention) {
      this.medicalAttention.procedureCodes.push(cup);
      console.log('💾 Código CUPS agregado a medicalAttention. Total de códigos:', this.medicalAttention.procedureCodes.length);
      console.log('📋 Lista completa de códigos CUPS en medicalAttention:', this.medicalAttention.procedureCodes);
    }
    this.searchInputCupsValue = '';
    this.resultsSearchigCups = [];
  }

  moreDetailsCup(cup: CupsCodes) {
    this.alertService.presentBasicAlert(
      'Detalle de código',
      cup.code + ' - ' + cup.name
    );
    return;
  }

  unselectCup(cup: CupsCodes) {
    this.medicalAttention?.procedureCodes.splice(
      this.medicalAttention.procedureCodes.indexOf(cup),
      1
    );
  }

  searchCupsByName(name: string) {
    this.resultsSearchigCups = this.cupsCodesList.filter(
      (cup) => cup.code.toLowerCase().indexOf(name) > -1
    );
    console.log('🔍 Resultados filtrados de códigos CUPS:', this.resultsSearchigCups);
    console.log('📊 Detalle de cada código CUPS encontrado:');
    this.resultsSearchigCups.forEach((cup, index) => {
      console.log(`  ${index + 1}. Código: ${cup.code}, Nombre: ${cup.name}`);
    });
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
    this.loadingService.showLoadingBasic('Cargando...');
    this.patientsService
      .searchPatientClinic(dni, this.idClinic)
      .pipe(
        catchError((error) => {
          this.loadingService.dismiss();
          console.error(
            'Ups! Algo salio mal al consultar los pacientes por DNI: ',
            error
          );
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result && result.length > 0) {
          this.loadingService.dismiss();
          this.medicalAttentionsResponse = result;
          this.patientList = result.map((ma: any) => ma.patient);
          this.resultsSearchigPatient = this.patientList.filter(
            (patient) => patient.dni.toLowerCase().indexOf(dni) > -1
          );
        } else {
          this.medicalAttention = new MedicalAttention();
          this.medicalAttention.patient = new Patient();
          this.medicalAttention.patient.dni = dni;
          this.profileForm.patchValue({
            dni: dni,
          });
          this.loadingService.dismiss();
          this.changeStatusManulIntake(true);
          this.changeStatusLookingForPatient(true);
        }
      });
  }

  yearValidator(): boolean {
    let inputYear = this.profileForm.value.birthday!;
    if (inputYear == null || inputYear.trim() === '') {
      this.profileForm.value.birthday = '1900';
      return true;
    }
    const numericInputYear = parseInt(inputYear, 10);
    const regex = /^(1900|[1-9]\d{3}|1[89]\d{2}|20[01]\d|202[0-4])$/;
    return (
      regex.test(inputYear) &&
      numericInputYear <= this.currentYear &&
      numericInputYear >= 1900
    );
  }

  toValidateRequiredData(): boolean {
    if (
      this.medicalAttention?.patient?.dni &&
      this.medicalAttention?.procedureCodes.length > 0 &&
      this.medicalAttention?.specialty
    ) {
      return true;
    } else {
      return false;
    }
  }

  toValidatePatientData() {
    console.log('🔍 Validando datos del paciente...');
    console.log('📋 Datos completos de medicalAttention:', this.medicalAttention);
    console.log('🏥 Especialidad seleccionada:', this.medicalAttention?.specialty);
    console.log('🔢 Códigos CUPS seleccionados:', this.medicalAttention?.procedureCodes);
    console.log('👤 Datos del paciente:', this.medicalAttention?.patient);
    
    if (this.toValidateRequiredData() && this.yearValidator()) {
      console.log('✅ Validación exitosa, guardando atención médica...');
      this.saveMedicalAttention();
    } else {
      console.log('❌ Validación fallida');
      console.log('📊 Estado de validación:');
      console.log('  - DNI del paciente:', !!this.medicalAttention?.patient?.dni);
      console.log('  - Códigos CUPS:', this.medicalAttention?.procedureCodes?.length > 0);
      console.log('  - Especialidad:', !!this.medicalAttention?.specialty);
      console.log('  - Año válido:', this.yearValidator());
      
      this.alertService.presentBasicAlert(
        '¡Estas olvidando algo!',
        'Es necesario diligenciar el DNI del paciente, además de seleccionar una especialidad y al menos un código CUPS'
      );
    }
  }

  patientSelected(patient: Patient) {
    const medicalAttentionFound = this.medicalAttentionsResponse.find(
      (ma: any) => ma.patient.dni === patient.dni
    );

    if (medicalAttentionFound) {
      this.medicalAttention = new MedicalAttention();
      this.medicalAttention.patient = patient;
      this.medicalAttention.programming = medicalAttentionFound.programming;
      this.medicalAttention.specialty = medicalAttentionFound.specialty;
      this.medicalAttention.procedureCodes =
        medicalAttentionFound.procedureCodesEntity || [];
      if (medicalAttentionFound.programming) {
        this.medicalAttention.programming =
          this.programmingTypeMap[medicalAttentionFound.programming] ||
          medicalAttentionFound.programming;
      }
    } else {
      this.medicalAttention = new MedicalAttention();
      this.medicalAttention.patient = patient;
      this.medicalAttention.specialty = new Specialty();
      this.medicalAttention.procedureCodes = [];
    }

    this.setFormPatient();
    this.resultsSearchigPatient = [];
    this.changeStatusLookingForPatient(true);
  }

  handleInputSpecialtyName(event: any) {
    const query = event.target.value.toLowerCase().trim();
    console.log('🔍 Búsqueda de especialidad:', query);
    console.log('📋 Lista completa de especialidades:', this.specialtiesList);
    
    if (query != '' && query.length > 2) {
      this.resultsSearchigSpecialties = [];
      this.searchSpecialtyByName(query);
    } else {
      this.medicalAttention.specialty = new Specialty();
    }
  }

  specialtySelected(specialty: Specialty) {
    console.log('✅ Especialidad seleccionada:', specialty);
    console.log('🆔 ID de especialidad seleccionada:', specialty.id);
    console.log('📝 Nombre de especialidad seleccionada:', specialty.name);
    
    if (this.medicalAttention) {
      this.medicalAttention.specialty = specialty;
      console.log('💾 Especialidad guardada en medicalAttention:', this.medicalAttention.specialty);
    }
    this.resultsSearchigSpecialties = [];
  }

  searchSpecialtyByName(name: string) {
    this.resultsSearchigSpecialties = this.specialtiesList.filter(
      (specialty) => specialty.name.toLowerCase().indexOf(name) > -1
    );
    console.log('🔍 Resultados filtrados de especialidades:', this.resultsSearchigSpecialties);
    console.log('📊 Detalle de cada especialidad encontrada:');
    this.resultsSearchigSpecialties.forEach((specialty, index) => {
      console.log(`  ${index + 1}. ID: ${specialty.id}, Nombre: ${specialty.name}`);
    });
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
    try {
      await this.alertService.presentBasicAlert(
        '¡Ups!',
        'Parece que tu dispositivo no puede escanear códigos' +
          ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.'
      );
    } catch (error) {
      console.error(
        'Error mostrando mensaje de dispositivo no soportado:',
        error
      );
    }
  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      // Intentar parsear como JSON primero
      obj = JSON.parse(obj);
      obj.patient.birthday = this.parseBirthday(obj.patient.birthday);
      return obj;
    } catch (e) {
      // Si no es JSON, procesar como formato separado por pipes
      try {
        const parts = obj.split('|');
        if (parts.length >= 11) {
          // 1. Tipo de documento
          const documentType = parts[0];
          // 2. Número de cédula
          const dni = parts[1];
          // 3. Primer apellido
          const firstLastName = parts[2].trim();
          // 4. Segundo apellido (puede estar vacío)
          const secondLastName = parts[3].trim();
          // 5. Primer nombre
          const firstName = parts[4].trim();
          // 6. Segundo nombre
          const secondName = parts[5].trim();
          // 7. Género
          const gender = parts[6];
          // 8. Fecha de nacimiento
          const birthday = this.parseBirthday(parts[7]);
          // 9. Registro (aparece en pantalla)
          const register = parts[8];
          // 10. Especialidad
          const specialty = parts[9];
          // 11. CUPS
          const cupsCode = parts[10];
          // 12. Tipo de programación (externa/interna)
          const programming = parts[11];
          
          // Construir nombre completo y apellidos
          let name = firstName;
          if (secondName) {
            name += ' ' + secondName;
          }
          
          let lastname = firstLastName;
          if (secondLastName) {
            lastname += ' ' + secondLastName;
          }
          
          // Mapear género
          let mappedGender = gender;
          if (gender === 'F') {
            mappedGender = 'Femenino';
          } else if (gender === 'M') {
            mappedGender = 'Masculino';
          }
          
          // Mapear tipo de programación
          let mappedProgramming = programming;
          if (programming.toLowerCase() === 'externa') {
            mappedProgramming = 'cirugía electiva';
          } else if (programming.toLowerCase() === 'interna') {
            mappedProgramming = 'programada de piso';
          }
          
          // Buscar el nombre del CUPS en la lista local
          let cupsName = '';
          const foundCup = this.cupsCodesList.find(cup => cup.code === cupsCode);
          if (foundCup) {
            cupsName = foundCup.name;
          }
          
          return {
            documentType: documentType,
            patient: {
              dni: dni,
              name: name,
              lastname: lastname,
              gender: mappedGender,
              birthday: birthday
            },
            register: register,
            specialty: {
              name: specialty
            },
            procedureCodes: [{
              code: cupsCode,
              name: cupsName
            }],
            programming: mappedProgramming
          };
        }
      } catch (pipeError) {
        console.log('Error procesando formato de pipes:', pipeError);
      }
      
      this.manualIntake = true;
      console.log(e);
      return {};
    }
  }

  private saveMedicalAttention(): void {
    if (this.manualIntake) {
      this.medicalAttention.numeroResgistro =
        this.profileForm.value.registerCode ?? '';
      this.medicalAttention.programming =
        this.profileForm.value.programmingType ?? '';
      this.medicalAttention.patient.dni = this.profileForm.value.dni ?? '';
      this.medicalAttention.patient.name = this.profileForm.value.name
        ? this.profileForm.value.name
        : 'No registra';
      this.medicalAttention.patient.lastname = this.profileForm.value.lastName
        ? this.profileForm.value.lastName
        : 'No registra';
      this.medicalAttention.patient.gender =
        this.profileForm.value.gender ?? null!;
      this.medicalAttention.patient.birthday = this.parseBirthday(
        (this.profileForm.value.birthday ?? '1950') + '-01-01'
      );
    }

    const existePaciente =
      this.medicalAttetionRepository.existsPatientInProgressAttentions(
        this.workingAreaRepository.getClinic().id,
        this.authService.getLoggedAccount().id,
        this.medicalAttention.patient.dni
      );

    if (existePaciente) {
      this.alertService.presentBasicAlert(
        '¡Con cuidado!',
        'El paciente ingresado tiene un servicio médico sin finalizar. Para iniciar un nuevo servicio con este paciente debe terminar el actual.'
      );
      return;
    }

    this.medicalAttention.patient.email = 'dummy@mychecktime.com';
    this.medicalAttention.patient.phone = '12345';
    this.medicalAttention.patient.simpleBirthdayDate =
      this.datepipe.transform(
        this.medicalAttention.patient.birthday,
        'yyyy-MM-dd'
      ) ?? '';
    this.medicalAttention.patient.updated_at =
      this.datepipe.transform(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSZ") ?? '';
    this.medicalAttention.patient.created_at =
      this.datepipe.transform(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSZ") ?? '';

    this.medicalAttention.idOperatingRoom = -1; //esta variable debería eliminarse
    this.medicalAttention.operatingRoom = new OperationRoom();

    this.medicalAttention.operatingRoom.clinic_id =
      this.workingAreaRepository.getClinic().id;

    this.medicalAttention.originDate = new Date();
    this.medicalAttention.simpleOriginDate =
      this.datepipe.transform(this.medicalAttention.originDate, 'yyyy-MM-dd') ??
      '';
    this.medicalAttention.simpleOriginHour =
      this.datepipe.transform(this.medicalAttention.originDate, 'HH:mm:ss') ??
      '';

    this.medicalAttention.idClinica = this.workingAreaRepository.getClinic().id;
    this.medicalAttention.currentAnesthesiologist =
      new AnesthesiologistProfile();
    this.medicalAttention.currentAnesthesiologist.id =
      this.authService.getLoggedAccount().id;
    this.medicalAttention.currentAnesthesiologist.name =
      this.authService.getLoggedAccount().name;
    this.medicalAttention.currentAnesthesiologist.lastname =
      this.authService.getLoggedAccount().lastname;
    this.medicalAttention.currentAnesthesiologist.lastnameS =
      this.authService.getLoggedAccount().lastnameS;
    this.medicalAttention.currentAnesthesiologist.gender =
      this.authService.getLoggedAccount().gender;
    this.medicalAttention.currentAnesthesiologist.phone =
      this.authService.getLoggedAccount().phone;
    this.medicalAttention.currentAnesthesiologist.email =
      this.authService.getLoggedAccount().email;
    this.medicalAttention.currentAnesthesiologist.status =
      this.authService.getLoggedAccount().status;
    this.medicalAttention.anestehsiologist = [];
    this.medicalAttention.anestehsiologist.push(
      this.medicalAttention.currentAnesthesiologist
    );
    this.medicalAttention.state = StatusService.INICIO;

    this.loadingService.showLoadingBasic('Cargando...');
    this.medicalAttetionRepository
      .addMedicalAttention(this.medicalAttention)
      .then((r) => {
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('home');
      })
      .catch((e) => this.loadingService.dismiss());
  }

  programmingTypeMap: { [key: string]: string } = {
    'Programación ambulatoria': 'cirugía electiva',
  };

  setFormPatient() {
    const mappedProgramming =
      this.programmingTypeMap[this.medicalAttention.programming] ||
      this.medicalAttention.programming;
    this.profileForm.patchValue({
      registerCode: this.medicalAttention.numeroResgistro,
      programmingType: mappedProgramming,
      dni: this.medicalAttention.patient.dni,
      name: this.medicalAttention.patient.name,
      lastName: this.medicalAttention.patient.lastname,
      gender: this.medicalAttention.patient.gender,
      birthday: this.getBirthdayYear(),
    });
  }

  getBirthdayYear(): string {
    let year = '';
    if (this.medicalAttention && this.medicalAttention.patient.birthday) {
      year = new Date(this.medicalAttention?.patient.birthday.toString())
        .getFullYear()
        .toString();
    }
    return year;
  }

  getBirthdayYearFromDate(birthday: Date): string {
    if (birthday) {
      return new Date(birthday).getFullYear().toString();
    }
    return '';
  }

  private parseBirthday(bday: string): Date {
    const tokens = bday.split('-').map((t) => parseInt(t));
    return new Date(tokens[0], tokens[1] - 1, tokens[2]);
  }
}
