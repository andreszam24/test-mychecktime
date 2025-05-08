import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from '../../components/events-panel/events-panel.component';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { ConceptTimeReplacementService } from 'src/app/services/concept-time-replacement.service';
import { SurgeonService } from 'src/app/services/surgeon.service';
import { InstrumentTechnicianService } from 'src/app/services/instrument-technician.service';
import { OperatingRoomList } from 'src/app/models/operating-room-list.model';
import { Recambio } from 'src/app/models/recambio.model';
import { ConceptoTiempoRecambio } from 'src/app/models/concepto-tiempo-recambio.model';
import { Cirujano } from 'src/app/models/cirujano.model';
import { Instrumentador } from 'src/app/models/instrumentador.model';
import { ParametersTimeCalculation } from 'src/app/models/parameters-time-calculation.model';
import { catchError, of } from 'rxjs';
import { StatusService } from 'src/app/services/status.service';
import { AuthService, USER_KEY } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { Toast } from '@capacitor/toast';
import {
  AlertController,
  IonAlert,
  IonButton,
} from '@ionic/angular/standalone';
import { AudioAlertComponent } from 'src/app/components/audio-alert/audio-alert.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { FromOperatingRoomTo } from 'src/app/models/from-operating-room-to.model';
import { Recover } from 'src/app/models/recover.model';
import { ExitOperatingRoomList } from 'src/app/models/exit-operating-room-list.model';

@Component({
  selector: 'app-operating-room-list',
  templateUrl: './operating-room-list.page.html',
  styleUrls: ['./operating-room-list.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
    EventsPanelComponent,
    IonButton,
    AudioAlertComponent,
    ButtonPanelComponent,
  ],
})
export class OperatingRoomListPage implements OnInit {
  showAudioAlert = false;
  header = 'Validación lista quirofano';
  alertButtons = [
    {
      text: 'Volver',
      cssClass: 'alert-button-cancel',
      role: 'cancel',
      handler: () => {
        this.navCtrl.back();
      },
    },
  ];
  textValidate: string;
  public showContinueButton = false;
  showSearchConcepts: boolean = false;
  operatingRoomList: OperatingRoomList;
  recambio: Recambio;
  parametersTimeCalculation = new ParametersTimeCalculation();
  isChangePatientTime = true;
  listConceptTimeReplacement: ConceptoTiempoRecambio[] = [];
  selectedConceptTimeReplacement: ConceptoTiempoRecambio = new ConceptoTiempoRecambio();
  resultsSearchigConceptTimeReplacement = [...this.listConceptTimeReplacement];
  listSurgeons: Cirujano[] = [];
  resultsSearchigSurgeons = [...this.listSurgeons];
  selectedSurgeon: Cirujano = new Cirujano();
  listInstrumentTechnicians: Instrumentador[] = [];
  resultsSearchigInstrumentTechnicians = [...this.listInstrumentTechnicians];
  selectedInstrumentTechnician: Instrumentador = new Instrumentador();
  showConceptSearch = false;
  audioSrc: string;
  model: any = {
    confirmMembers: false,
    confirmIdentity: false,
    criticalEvents: false,
    anesthesiaTeamReview: false,
    nurseTeamReview: false,
    administeredProphylaxis: null,
    diagnosticImages: null,
  };
  dataUser: any;
  datepipe = new DatePipe('en-US');

  exitOperatingRoomList: ExitOperatingRoomList;
  recover: Recover;
  modelRecover: any = {
    aldrete: '-1',
    bromage: '-1',
    ramsay: '-1',
    eva: 0,
    nausea: false,
  };
  modelExit: any = {
    confirmProcedure: false,
    instrumentsCount: false,
    verifyTagsPatient: false,
    problemsResolve: false,
    recoveryReview: null,
    bloodCount: null,
    bloodCountUnits: 'ml',
  };

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private medicalService: InProgressMedicalAttentionService,
    private conceptTimeReplacementService: ConceptTimeReplacementService,
    private surgeonService: SurgeonService,
    private instrumentTechnicianService: InstrumentTechnicianService,
    private loadingService: LoadingService,
    private alertCtrl: AlertController
  ) {
    this.operatingRoomList = new OperatingRoomList();
    this.recover = new Recover();
    this.exitOperatingRoomList = new ExitOperatingRoomList();
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.loadMasterData();
    this.initializeModel();
  }

  ionViewDidEnter() {
    if (!this.model.confirmMembers) {
      this.showAudioAlert = true;
      this.model.confirmMembers = true;
      this.model.confirmIdentity = true;
      this.model.criticalEvents = true;
      this.model.anesthesiaTeamReview = true;
      this.model.nurseTeamReview = true;
      this.model.administeredProphylaxis = false;
      this.model.diagnosticImages = false;
      this.checkDate();
      this.checkDateExit();
    } else {
      this.showAudioAlert = false;
    }
  }

  initializeModel() {
    if (this.idRole) {
      this.selectedInstrumentTechnician = {
        id: 92,
        name: 'Instrumentador',
        lastname: 'Instrumentador',
        lastnameS: 'Instumentador',
        gender: 'Masculino',
        phone: '123',
        email: 'instrumentadora@mychecktime.com',
        status: 'activo',
        role_id: 6,
      };
      this.selectedSurgeon = {
        id: 91,
        name: 'Cirujano',
        lastname: 'Cirujano',
        lastnameS: 'Cirujano',
        gender: 'Masculino',
        phone: '123',
        email: 'cirujano@mychecktime.com',
        status: 'activo',
        role_id: 5,
      };
    }
    if (this.idRole) {
      this.audioSrc = './../../../assets/audio/Audio_2_Sec.mp3';
      this.textValidate =
        'CONFIRMEN LA IDENTIDAD DEL PACIENTE, EL PROCEDIMIENTO, LA LATERALIDAD, LAS IMÁGENES Y ASPECTOS CRÍTICOS. VERIFIQUE LA ESTERILIDAD DEL MATERIAL Y RESUELVA DUDAS SOBRE EQUIPOS O INSUMOS. CONFIRME LA ADMINISTRACIÓN CORRECTA DE MEDICAMENTOS Y LA PREPARACIÓN ADECUADA DEL PACIENTE.';
    } else {
      this.audioSrc = './../../../assets/audio/Audio_2.mp3';
      this.textValidate =
        'ANTES DE INICIAR LA ANESTESIA, SOLICITE AL CIRUJANO CONFIRMAR VERBALMENTE LA IDENTIDAD DEL PACIENTE, EL PROCEDIMIENTO, LA LATERALIDAD, LA REVISIÓN DE IMÁGENES Y LOS ASPECTOS CRÍTICOS DEL CASO. VERIFIQUE CON LA INSTRUMENTADORA Y LA CASA MÉDICA LA ESTERILIDAD DEL MATERIAL, Y RESUELVA CUALQUIER DUDA SOBRE EL INSTRUMENTAL O LOS EQUIPOS. FINALMENTE, CONFIRME CON LA CIRCULANTE LA HORA EXACTA DE ADMINISTRACIÓN DE LA PROFILAXIS ANTIBIÓTICA.';
    }
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  loadMasterData() {
    this.getAllSurgeons();
    this.getAllInstrumentTechnicians();
    this.getConceptTimeReplacement();
  }

  getAllSurgeons() {
    this.listSurgeons = this.surgeonService.getLocalSurgeons();
    if (this.listSurgeons.length < 1) {
      this.surgeonService
        .getListOfSurgeons()
        .pipe(
          catchError((error) => {
            console.error(
              'Ups! Algo salio mal al consultar los cirujanos: ',
              error
            );
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece algo salio mal conusltando las cirujanos y no logramos conectar con el servidor'
            );
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result && result.length > 0) {
            this.listSurgeons = result;
          } else {
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece que el servidor no tiene data de cirujanos.'
            );
          }
        });
    }
  }

  getAllInstrumentTechnicians() {
    this.listInstrumentTechnicians =
      this.instrumentTechnicianService.getLocalInstrumentTechnicians();
    if (this.listInstrumentTechnicians.length < 1) {
      this.instrumentTechnicianService
        .getListOfInstrumentTechnicians()
        .pipe(
          catchError((error) => {
            console.error(
              'Ups! Algo salio mal al consultar los instrumentadores: ',
              error
            );
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece algo salio mal conusltando los instrumentadores y no logramos conectar con el servidor'
            );
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result && result.length > 0) {
            this.listInstrumentTechnicians = result;
          } else {
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece que el servidor no tiene data de instrumentadores.'
            );
          }
        });
    }
  }

  getConceptTimeReplacement() {
    this.listConceptTimeReplacement =
      this.conceptTimeReplacementService.getLocalConceptTimeReplacement();
    if (this.listConceptTimeReplacement.length < 1) {
      this.conceptTimeReplacementService
        .getListConceptTimeReplacement()
        .pipe(
          catchError((error) => {
            console.error(
              'Ups! Algo salio mal al consultar los tiempos de recambio: ',
              error
            );
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece algo salio mal conusltando los tiempos de recambio y no logramos conectar con el servidor'
            );
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result && result.length > 0) {
            this.listConceptTimeReplacement = result;
          } else {
            this.alertService.presentBasicAlert(
              'Oops!',
              'Parece que el servidor no tiene data de tiempos de recambio.'
            );
          }
        });
    }
  }

  private showErrorToast(msg: string) {
    Toast.show({
      text: msg,
      duration: 'long',
    });
  }

  isValid() {
    let valid = true;
    for (var property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if (this.model[property] === null) {
          valid = false;
        }
      }
    }
    if (!this.selectedSurgeon.name || !this.selectedInstrumentTechnician.name) {
      valid = false;
    }

    return valid;
  }

  endPageProccess() {
    if (this.isChangePatientTime) {
      this.showAlertTiempoRecambio();
    } else {
      this.goToNextPage();
    }
  }

  showAlertTiempoRecambio() {
    this.recambio = new Recambio();
    this.loadingService.showLoadingBasic('Cargando...');
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        console.log(
          'entro a getInProgressMedicalAtenttion de showAlertTiempoRecambio '
        );
        this.parametersTimeCalculation.idAnes = sm.currentAnesthesiologist.id;
        this.parametersTimeCalculation.idOperatingRoom = sm.idOperatingRoom;
        this.parametersTimeCalculation.operatingRoomDate =
          this.operatingRoomList.checkDate.toISOString();
        this.medicalService
          .calculateChangePatientTime(this.parametersTimeCalculation)
          .subscribe(
            (res) => {
              if (res !== null) {
                this.loadingService.dismiss();
                this.recambio.elapsedTime = res.replace(/"/g, '');
                this.showAlert(this.recambio.elapsedTime);
              }
            },
            (e) => {
              this.loadingService.dismiss();
              if (
                e.status !== undefined &&
                e.status === 401 &&
                AuthService.getAuthToken() != null
              ) {
                this.showAlertTiempoRecambio();
              } else {
                this.showErrorToast(
                  'Trabajando Offline por baja señal. No se cálculo el tiempo de recambio. Pulse continuar.'
                );
                this.isChangePatientTime = false;
                this.recambio.elapsedTime =
                  'No se pudo calcular el tiempo de recambio';
                let concepto = new ConceptoTiempoRecambio();
                concepto.name = 'No se pudo calcular el tiempo de recambio';
                this.recambio.conceptoRecambio = concepto;
              }
            }
          );
      })
      .catch((err) => console.log('fallo desde aca', err));
  }

  async showAlert(changeTime: string) {
    const alert = await this.alertCtrl.create({
      header: `Tiempo De Recambio - ${changeTime}.`,
      cssClass: 'centered-header',
      message: `El tiempo de recambio fue mayor a 30 minutos o considera que la cirugía inició tarde? Si o No`,
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => this.processReplacementResponse(true),
        },
        {
          text: 'Si',
          handler: () => this.processReplacementResponse(false),
        },
      ],
    });
    await alert.present();
  }

  private processReplacementResponse(accepted: boolean) {
    this.recambio.accepted = accepted;
    const time = this.recambio.elapsedTime.split(':');

    if (
      !accepted ||
      parseInt(time[0]) > 0 ||
      parseInt(time[1]) > 0 ||
      parseInt(time[2]) > 30
    ) {
      this.showSearchConcepts = true;
    } else {
      this.goToNextPage();
    }
  }

  processJustification() {
    if (
      !!this.selectedConceptTimeReplacement &&
      !!this.selectedConceptTimeReplacement.name
    ) {
      this.recambio.conceptoRecambio = this.selectedConceptTimeReplacement;
      this.goToNextPage();
    }
  }

  checkDate() {
    this.operatingRoomList.checkDate = new Date();
    this.operatingRoomList.simpleCheckDate = this.datepipe.transform(
      this.operatingRoomList.checkDate,
      'yyyy-MM-dd'
    )!;
    this.operatingRoomList.simpleCheckHour = this.datepipe.transform(
      this.operatingRoomList.checkDate,
      'HH:mm:ss'
    )!;
  }

  private checkDateExit() {
    this.exitOperatingRoomList.checkDate = new Date();
    this.exitOperatingRoomList.simpleCheckDate = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate, 
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleCheckHour = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate,
      'HH:mm:ss'
    )!;
  }

  private async goToNextPageExit() {
    const exitOperatingRoomList = this.mapViewToModelExit();
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.exitOperatingRoomList = exitOperatingRoomList;
        sm.state = StatusService.EXIT_OPERATING_ROOM_LIST;

        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            if (result) {
              this.navCtrl.navigateForward('/home');
            }
          })
          .catch(() => {
            this.navCtrl.navigateForward('/home');
            console.error('No se pudo guardar el servicio médico');
          });
      })
      .catch(() => {
        this.navCtrl.navigateForward('/home');
        console.log('Error consultando la atencion médica');
      });
  }

  private mapViewToModelExit() {
    this.exitOperatingRoomList.confirmProcedure = this.modelExit.confirmProcedure;
    this.exitOperatingRoomList.instrumentsCount = this.modelExit.instrumentsCount;
    this.exitOperatingRoomList.verifyTagsPatient = this.modelExit.verifyTagsPatient;
    this.exitOperatingRoomList.problemsResolve = this.modelExit.problemsResolve;
    this.exitOperatingRoomList.recoveryReview = this.modelExit.recoveryReview;
    this.exitOperatingRoomList.bloodCount = this.modelExit.bloodCount;
    this.exitOperatingRoomList.bloodCountUnits = this.modelExit.bloodCountUnits;
    this.exitOperatingRoomList.endProcedureDate = new Date();
    this.exitOperatingRoomList.simpleEndProcedureDate = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleEndProcedureHour = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'HH:mm:ss'
    )!;

    return this.exitOperatingRoomList;
  }

  goToNextPage() {
    const operatingRoomList = this.mapViewToModel();
    const exitOperatingRoomList = this.mapViewToModelExit();
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.surgeon = this.selectedSurgeon;
        sm.instrumentator = this.selectedInstrumentTechnician;

        sm.operatingRoomList = operatingRoomList;
        sm.state = StatusService.OPERATING_ROOM_LIST;

        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then(async (result) => {
            if (result) {
              if (this.idRole) {
                await this.navCtrl.navigateForward('/home');
              } else {
                this.navCtrl.navigateForward('/anesthesia-operating-room');
              }
            }
          })
          .catch((err) => {
            console.error('No se pudo guardar el servicio médico', err);
            console.error(
              'No se pudo guardar el servicio médico -->',
              err.message
            );
          })
          .finally(() => this.loadingService.dismiss());
      })
      .catch((err) => console.log('Error consultando la atencion médica', err))
      .finally(() => this.loadingService.dismiss());
  }

  private mapViewToModel() {
    this.operatingRoomList.confirmMembers = this.model.confirmMembers;
    this.operatingRoomList.confirmIdentity = this.model.confirmIdentity;
    this.operatingRoomList.criticalEvents = this.model.criticalEvents;
    this.operatingRoomList.anesthesiaTeamReview = this.model.anesthesiaTeamReview;
    this.operatingRoomList.nurseTeamReview = this.model.nurseTeamReview;
    this.operatingRoomList.administeredProphylaxis = this.model.administeredProphylaxis;
    this.operatingRoomList.diagnosticImages = this.model.diagnosticImages;
    this.operatingRoomList.recambio = this.recambio;
    this.operatingRoomList.status = StatusService.OPERATING_ROOM_LIST;
    return this.operatingRoomList;
  }

  searchSurgeons(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 2) {
      this.resultsSearchigSurgeons = [];
      this.searchSurgeonsByName(query);
    }
  }

  searchSurgeonsByName(name: string) {
    this.resultsSearchigSurgeons = this.listSurgeons.filter((surgeon) => {
      const fullName = `${surgeon.name} ${surgeon.lastname}`.toLowerCase();
      return fullName.includes(name);
    });
    if (this.resultsSearchigSurgeons.length === 0) {
      this.alertService.presentBasicAlert(
        'Oops!',
        'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.'
      );
    }
  }

  surgeonsSelected(surgeon: Cirujano) {
    this.selectedSurgeon = surgeon;
    this.resultsSearchigSurgeons = [];
  }

  searchInstrumentTechnician(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 2) {
      this.resultsSearchigInstrumentTechnicians = [];
      this.searchInstrumentTechnicianByName(query);
    }
  }

  searchInstrumentTechnicianByName(name: string) {
    this.resultsSearchigInstrumentTechnicians = this.listInstrumentTechnicians.filter(
      (instrumentTechnician) => {
        const fullName = `${instrumentTechnician.name} ${instrumentTechnician.lastname}`.toLowerCase();
        return fullName.includes(name);
      }
    );
    if (this.resultsSearchigInstrumentTechnicians.length === 0) {
      this.alertService.presentBasicAlert(
        'Oops!',
        'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.'
      );
    }
  }

  instrumentTechnicianSelected(instrumentTechnician: Instrumentador) {
    this.selectedInstrumentTechnician = instrumentTechnician;
    this.resultsSearchigInstrumentTechnicians = [];
  }

  searchConceptTime(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 2) {
      this.resultsSearchigConceptTimeReplacement = [];
      this.searchConceptTimeByName(query);
    }
  }

  searchConceptTimeByName(name: string) {
    this.resultsSearchigConceptTimeReplacement =
      this.listConceptTimeReplacement.filter(
        (concept) => concept.name.toLowerCase().indexOf(name) > -1
      );
    if (this.resultsSearchigConceptTimeReplacement.length === 0) {
      this.alertService.presentBasicAlert(
        'Oops!',
        'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.'
      );
    }
  }

  conceptTimeReplacementselected(
    conceptTimeReplacement: ConceptoTiempoRecambio
  ) {
    this.selectedConceptTimeReplacement = conceptTimeReplacement;
    this.resultsSearchigConceptTimeReplacement = [];
  }
}
