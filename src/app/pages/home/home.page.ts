import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, MenuController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonCard, IonCardContent, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions, IonImg, AlertController } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService, USER_KEY } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { of, catchError, Subscription } from 'rxjs';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { StatusService } from 'src/app/services/status.service';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { MedicalAttentionService } from 'src/app/services/medical-attention.service';
import { WorkingAreaService } from 'src/app/services/working-area.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, IonCard, 
    IonCardContent, IonList, IonItem, IonItemSliding, IonItemOption, IonItemOptions, 
    IonImg, IonicModule, FormsModule, InternetStatusComponent, CommonModule, 
    HeaderComponent, RouterLink
  ],
})
export class HomePage implements OnInit {

  patientsLis: Patient[] = [];
  clinicName: string = 'No identificamos la clínica';
  anesthesiologistId: number;
  attentionsInProgress: MedicalAttention[] = [];
  private internetStatusSubscription: Subscription;
  private finishedServicesKey = 'finished_services';
  dataUser: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private httpInProgressMedicalAttention: InProgressMedicalAttentionService,
    private httpMedicalAttention: MedicalAttentionService,
    private alertCtrl: AlertController,
    private sharedDataService: SharedDataService,
    private workingAreaRepository: WorkingAreaService,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    private menu: MenuController
  ) { 
    this.httpInProgressMedicalAttention.selectMedicalAttention('');
    this.listFinishedService = localStorage.getItem(this.finishedServicesKey);
    this.dataUser = localStorage.getItem(USER_KEY);
  }
  ionViewWillEnter() {
    this.extractUserData();
    this.menu.close('menu-anestesia');
    this.checkingInternetStatus();
    this.listFinishedService = JSON.parse(localStorage.getItem(this.finishedServicesKey) || '[]');
    this.cdr.detectChanges();
  }
  ngOnInit(): void {
    // this.updateFinishedServiceList();
    // this.listenStorageChanges(); 
  }

  ngOnDestroy(): void {
    if (this.internetStatusSubscription) {
      this.internetStatusSubscription.unsubscribe();
    }
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  private updateFinishedServiceList(): void {
    const data = localStorage.getItem(this.finishedServicesKey);
    this.listFinishedService = data ? JSON.parse(data) : [];
    this.cdr.detectChanges();
  }

  private listenStorageChanges(): void {
    window.addEventListener('storage', () => {
      this.updateFinishedServiceList();
    });
  }

  get isListFinishedServiceEmpty(): boolean {
    return !this.listFinishedService || this.listFinishedService.length === 0;
  }

  get listFinishedService(): any[] {
    const data = localStorage.getItem(this.finishedServicesKey);
    try {
      return JSON.parse(data || '[]');
    } catch {
      console.warn('Error al parsear listFinishedService desde localStorage');
      return [];
    }
  }
  
  set listFinishedService(value: any) {
    const parsedValue = Array.isArray(value) ? value : [];
    localStorage.setItem(this.finishedServicesKey, JSON.stringify(parsedValue));
  }


  private async checkingInternetStatus() { 
    const status = await Network.getStatus();
    if (status.connected) {
      this.getPendingMedicalAtenttions(
        this.workingAreaRepository.getClinic().id, 
        this.authService.getLoggedAccount().id
      ).finally(() => this.loadingService.dismiss());
    } else {
      this.searchPatientInLocal();
    }
  }

  async showOptionsModal(msg: string): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      let alert = await this.alertCtrl.create({
        message: msg,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              alert.dismiss().then(() => resolve(false));
              return false;
            }
          },
          {
            text: 'Aceptar',
            handler: () => {
              alert.dismiss().then(() => resolve(true));
              return false;
            }
          }
        ]
      });

      await alert.present();
    });
  }

  async showInformationalModal(msg: string) {
    let alert = await this.alertCtrl.create({
      message: msg,
      header: 'Atención',
      buttons: [
        {
          text: 'Cerrar',
          role: 'cancel',
          handler: () => {
            alert.dismiss();
            return false;
          }
        }
      ]
    });

    await alert.present();
  }

  private extractUserData() {
    return this.authService.user.subscribe({
      next: (userData) => {
        this.workingAreaRepository.setClinic(userData.account.clinics[0]);
        this.clinicName = this.workingAreaRepository.getClinic().name;
        this.anesthesiologistId = userData.account.id;
      },
      error: (e) => console.error('Extract User Data: ', e),
      complete: () => { },
    });
  }

  async getPendingMedicalAtenttions(clinicId: number, anesthesiologistId: number) {
    this.loadingService.showLoadingBasic('Cargando Hall...');
    this.httpInProgressMedicalAttention.searchPendingServices(clinicId, anesthesiologistId).subscribe({
      next: (data) => {
        this.attentionsInProgress = data;
        this.attentionsInProgress.sort((a, b) => a._id.localeCompare(b._id));
        this.cdr.detectChanges();
        this.loadingService.dismiss();
      },
      error: (error) => {
        console.error('Ups! Algo salió mal al consultar atenciones médicas pendientes: ', error);
        this.loadingService.dismiss();
      },
      complete: () => {
        this.loadingService.dismiss();
      },
      
    });
    this.loadingService.dismiss();
  }

  searchPatientInLocal() {
    this.httpInProgressMedicalAttention.getPendingMedicalAtenttions(this.workingAreaRepository.getClinic().id, this.authService.getLoggedAccount().id).then(
      services => {
        this.attentionsInProgress = services;
        this.attentionsInProgress.sort((a, b) => a._id.localeCompare(b._id));
      }
    ).catch(() => this.attentionsInProgress = []).finally(() => this.loadingService.dismiss());
  }

  getRoomName(medicalRecord: MedicalAttention) {
    let hall = 'Sin ingresar a sala';
    if (medicalRecord.operatingRoom !== undefined) {
      if (medicalRecord.operatingRoom.name !== null && medicalRecord.operatingRoom.name !== undefined) {
        hall = medicalRecord.operatingRoom.name;
      }
    }
    return hall;
  }

  getAttentionStage(sm: MedicalAttention): string {
    const medicalAttentionStage = sm.state;
    const colorMap = {
      [StatusService.INICIO]: 'var(--ion-color-app-purple)',
      [StatusService.FROM_OPERATING_ROOM_TO]: 'var(--ion-color-app-yellow)',
      [StatusService.TERMINADO]: 'transparent',
      [StatusService.CANCELADO]: 'transparent',
    };

    if (medicalAttentionStage === StatusService.FROM_OPERATING_ROOM_TO && this.idRole) {
      return 'var(--ion-color-app-red)';
    }
    if (StatusService.PATIENTS_IN_PREANESTHESIA.includes(medicalAttentionStage)) {
      return 'var(--ion-color-app-orange)';
    } else if (StatusService.PATIENT_IN_OPERETING_ROOM.includes(medicalAttentionStage)) {
      return 'var(--ion-color-app-red)';
    } else if (StatusService.PATIENTS_WITH_DISCHARGE_ORDER.includes(medicalAttentionStage)) {
      return 'var(--ion-color-app-blue)';
    }
    return colorMap[medicalAttentionStage] || 'transparent';
  }

  public goToPatientIntake() {
    this.router.navigateByUrl('/patient-intake');
  }

  public goToPatientSummary(medicalAttention: MedicalAttention) {
    const data = medicalAttention;
    this.sharedDataService.setDatos(data);
    this.router.navigateByUrl('/patient-summary');
  }

  deletePatient(selectedMedicalAttention: MedicalAttention) {
    this.showOptionsModal('¿Estás seguro de borrar este paciente?').then((userAccepted) => {
      if (userAccepted) {
        this.loadingService.showLoadingBasic('borrando paciente');
        this.httpMedicalAttention.deleteClinicalPatientRecord(selectedMedicalAttention)
          .pipe(
            catchError((error) => {
              this.loadingService.dismiss();
              console.error('Ups! Algo salió mal, el paciente no se pudo borrar', error);
              return of(null);
            })
          )
          .subscribe(response => {
            if (response === 'OK' || response === 'no existe') {
              this.deletePatientFromList(selectedMedicalAttention);
              this.httpInProgressMedicalAttention.borrarServicioLocal(selectedMedicalAttention);
              this.loadingService.dismiss();

            } else if (response === 'cirugia') {
              this.loadingService.dismiss();
              this.showInformationalModal('No puedes borrar este paciente porque ya se encuentra en quirófano');
            } else {
              this.loadingService.dismiss();
              console.log('SELECCIONAR-PACIENTE: Error borrando el paciente en remoto => ', response);
            }
          });
      } else {
        console.log('Operación de borrado cancelada por el usuario');
      }
    });
  }

  deletePatientFromList(registroMedico: MedicalAttention) {
    this.attentionsInProgress = this.attentionsInProgress.filter(
      registro => registro._id !== registroMedico._id
    );
    this.listFinishedService = this.attentionsInProgress;
    this.cdr.detectChanges();
  }

  
  selectAttentionServiceAndContinue(selectedMedicalAttention: MedicalAttention) {
    const stateRouteMap: { [key: string]: string } = {
        'nueva': '/pre-anesthesia',
        'AdmissionList': '/select-operating-room',
        'SelectOperatingRoom': '/check-patient-info',
        'OperatingRoomList': '/anesthesia-operating-room',
        'StartAnesthesia': '/anesthesia-operating-room',
        'EndStartAnesthesia': '/anesthesia-operating-room',
        'StartSurgery': '/anesthesia-operating-room',
        'EndSurgery':'/operating-room-exit-check',
        'ExitOperatingRoomList':'/exit-menu',
        'FromOperatingRoomTo':'/destination-selection',
        'DestinoCasa':'/home-destination',
        'DestinoHospitalizacion':'/hospitalization-destination',
        'DestinoUCI':'/uci-destination',
        'DestinoSalaDePaz':'/decease-destination',
        'DestinoCirugia':'/surgery-destination'
    };

    const nextState = stateRouteMap[selectedMedicalAttention.state];
    if (nextState) {
        this.httpInProgressMedicalAttention.selectMedicalAttention(selectedMedicalAttention._id);
        this.goToNextState(nextState);
    } else {
        console.error('Estado no manejado:', selectedMedicalAttention.state);
    }
}


  goToNextState(page:string) {
    this.router.navigateByUrl(page);
  }
}
