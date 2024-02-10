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
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { Toast } from '@capacitor/toast';
import { AlertController, Platform, IonAlert, IonButton } from '@ionic/angular/standalone';




@Component({
  selector: 'app-operating-room-list',
  templateUrl: './operating-room-list.page.html',
  styleUrls: ['./operating-room-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent, IonButton]
})
export class OperatingRoomListPage implements OnInit {
  @ViewChild('audioPlayer') audioPlayer: ElementRef;
  @ViewChild('audioAlert') audioAlert: IonAlert;

  

  private audio: any;
  public showContinueButton = false;
  showSearchConcepts:boolean =  false;
  operatingRoomList: OperatingRoomList;
  recambio: Recambio;
  parametersTimeCalculation = new ParametersTimeCalculation();
  isChangePatientTime=true;
  listConceptTimeReplacement: ConceptoTiempoRecambio[] = [];
  selectedConceptTimeReplacement: ConceptoTiempoRecambio = new ConceptoTiempoRecambio();
  resultsSearchigConceptTimeReplacement= [...this.listConceptTimeReplacement];
  listSurgeons: Cirujano[] = [];
  resultsSearchigSurgeons = [...this.listSurgeons];
  selectedSurgeon: Cirujano = new Cirujano();
  listInstrumentTechnicians: Instrumentador[] = [];
  resultsSearchigInstrumentTechnicians = [...this.listInstrumentTechnicians];
  selectedInstrumentTechnician: Instrumentador = new Instrumentador();
  
  showConceptSearch = false;

  model: any = {
    confirmMembers: false,
    confirmIdentity: false,
    criticalEvents: false,
    anesthesiaTeamReview: false,
    nurseTeamReview: false,
    administeredProphylaxis: null,
    diagnosticImages: null
  };

  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private medicalService: InProgressMedicalAttentionService,
    private conceptTimeReplacementService: ConceptTimeReplacementService,
    private surgeonService: SurgeonService,
    private instrumentTechnicianService: InstrumentTechnicianService,
    private loadingService: LoadingService,
    private alertCtrl: AlertController,
    private platform: Platform
  ) { 
    this.operatingRoomList = new OperatingRoomList();

  }

ngOnInit() {
  this.loadMasterData()  
  }

  ionViewDidEnter(){
    if (this.alertCtrl.getTop() != null) {
      this.playAudio();}
  }

  public alertButtons = [
    {
      text: 'Volver',
      cssClass: 'alert-button-cancel',
      role: 'cancel',
      handler: () => {
        this.navCtrl.navigateForward('home');
      },
    },
  ];

  playAudio() {
    this.audio = this.audioPlayer.nativeElement as HTMLAudioElement;
    if (this.audio) {
      this.audio.play();
      this.audio.addEventListener('ended', async () => {
        this.audioAlert.dismiss();
        console.log('fin');
      });
    }
  }

  loadMasterData() {
    this.getAllSurgeons();
    this.getAllInstrumentTechnicians();
    this.getConceptTimeReplacement();
  }

  getAllSurgeons(){
    this.listSurgeons = this.surgeonService.getLocalSurgeons();
    if (this.listSurgeons.length < 1) {
      this.surgeonService.getListOfSurgeons()
        .pipe(
          catchError((error) => {
            console.error('Ups! Algo salio mal al consultar los cirujanos: ', error);
            this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal conusltando las cirujanos y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.listSurgeons = result;
          } else {
            this.alertService.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de cirujanos.');
          }
        });
    }
  }

  getAllInstrumentTechnicians(){
    this.listInstrumentTechnicians = this.instrumentTechnicianService.getLocalInstrumentTechnicians();
    if (this.listInstrumentTechnicians.length < 1) {
      this.instrumentTechnicianService.getListOfInstrumentTechnicians()
        .pipe(
          catchError((error) => {
            console.error('Ups! Algo salio mal al consultar los instrumentadores: ', error);
            this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal conusltando los instrumentadores y no logramos conectar con el servidor');
            return of(null);
          })
        ).subscribe((result) => {
          if (result && result.length > 0) {
            this.listInstrumentTechnicians = result;
          } else {
            this.alertService.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de instrumentadores.');
          }
        });
    }
  }

  getConceptTimeReplacement(){
      this.listConceptTimeReplacement = this.conceptTimeReplacementService.getLocalConceptTimeReplacement();
      if (this.listConceptTimeReplacement.length < 1) {
        this.conceptTimeReplacementService.getListConceptTimeReplacement()
          .pipe(
            catchError((error) => {
              console.error('Ups! Algo salio mal al consultar los tiempos de recambio: ', error);
              this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal conusltando los tiempos de recambio y no logramos conectar con el servidor');
              return of(null);
            })
          ).subscribe((result) => {
            if (result && result.length > 0) {
              this.listConceptTimeReplacement = result;
            } else {
              this.alertService.presentBasicAlert('Oops!', 'Parece que el servidor no tiene data de tiempos de recambio.');
            }
          });
    }
   
  }

  private showErrorToast(msg: string) {
    Toast.show({
      text: msg,
      duration: 'long'
    });
  }

  isValid() {
    let valid = true;
    for (var property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if(this.model[property] === null) {
          valid = false;
        }
      }
    }
    if (!this.selectedSurgeon.name || !this.selectedInstrumentTechnician.name){
      valid = false;
    }

    return valid;
  }

  endPageProccess() {
    if(this.isChangePatientTime) {
    this.showAlertTiempoRecambio();
    } else {
      this.goToNextPage();
    }
  }

  showAlertTiempoRecambio() {
    this.recambio = new Recambio();
    this.loadingService.showLoadingBasic("Cargando...");
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {      
      this.parametersTimeCalculation.idAnes = sm.currentAnesthesiologist.id;
      this.parametersTimeCalculation.idOperatingRoom = sm.idOperatingRoom;
      this.parametersTimeCalculation.operatingRoomDate = this.operatingRoomList.checkDate.toISOString();
      this.medicalService.calculateChangePatientTime(this.parametersTimeCalculation).subscribe(
        res => {
          if(res !== null) {
            this.loadingService.dismiss();
              this.recambio.elapsedTime = res.replace(/"/g, "");
              this.showAlert(this.recambio.elapsedTime);
            }
        },e => {
          
          this.loadingService.dismiss(); 
          if(e.status !== undefined && e.status === 401 && AuthService.getAuthToken() != null){
            this.showAlertTiempoRecambio();
          }else{
            this.showErrorToast('Trabajando Offline por baja señal. No se cálculo el tiempo de recambio. Pulse continuar.');
            this.isChangePatientTime = false;
            this.recambio.elapsedTime = "No se pudo calcular el tiempo de recambio";
            let concepto = new ConceptoTiempoRecambio();
            concepto.name = "No se pudo calcular el tiempo de recambio"
            this.recambio.conceptoRecambio = concepto;
          }
        
      });
  });
}

async showAlert(changeTime: string){
  const alert = await this.alertCtrl.create({
    message: '¿El tiempo de recambio es de ' + changeTime + ' (Días:Horas:Minutos:Segundos)?',
    buttons: [
      {
        text: 'No',
        role: 'cancel',
        handler: () => this.processReplacementResponse(false)
      },
      {
        text: 'Si',
        handler: () => this.processReplacementResponse(true)
      }
    ]
  });
  await alert.present();

}

private processReplacementResponse(accepted: boolean){
  this.recambio.accepted = accepted;
  const time = this.recambio.elapsedTime.split(":");
  
  if(!accepted || parseInt(time[0]) > 0 || parseInt(time[1]) > 0 || parseInt(time[2]) > 30) {
    this.showSearchConcepts = true;
  } else {
    this.goToNextPage();
  }
}

processJustification(){
  if(!!this.selectedConceptTimeReplacement && !!this.selectedConceptTimeReplacement.name) {
    this.recambio.conceptoRecambio = this.selectedConceptTimeReplacement;
    this.goToNextPage();
  }
}

  checkDate() {
    this.operatingRoomList.checkDate = new Date();
    this.operatingRoomList.simpleCheckDate = this.datepipe.transform(this.operatingRoomList.checkDate,'yyyy-MM-dd')!;
    this.operatingRoomList.simpleCheckHour = this.datepipe.transform(this.operatingRoomList.checkDate,'HH:mm:ss')!;
  }

  goToNextPage() {
    const operatingRoomList = this.mapViewToModel();
    
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.surgeon = this.selectedSurgeon;
      sm.instrumentator = this.selectedInstrumentTechnician;

      sm.operatingRoomList = operatingRoomList;
      sm.state = StatusService.OPERATING_ROOM_LIST;

      this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              this.navCtrl.navigateForward('/anesthesia-operating-room');
            }
        }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion médica'));
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
    if (query != '' && query.length > 4) {
      this.resultsSearchigSurgeons = [];
      this.searchSurgeonsByName(query);
    } 
  }

  searchSurgeonsByName(name: string) {
    this.resultsSearchigSurgeons = this.listSurgeons.filter((surgeon) => surgeon.name.toLowerCase().indexOf(name) > -1);
    if (this.resultsSearchigSurgeons.length === 0) {
      this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
    } 
  }

  surgeonsSelected(surgeon: Cirujano) {
    this.selectedSurgeon = surgeon;
    this.resultsSearchigSurgeons = [];
  }

  searchInstrumentTechnician(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 4) {
      this.resultsSearchigInstrumentTechnicians = [];
      this.searchInstrumentTechnicianByName(query);
    } 
  }

  searchInstrumentTechnicianByName(name: string) {
    this.resultsSearchigInstrumentTechnicians = this.listInstrumentTechnicians.filter((instrumentTechnician) => instrumentTechnician.name.toLowerCase().indexOf(name) > -1);
    if (this.resultsSearchigInstrumentTechnicians.length === 0) {
      this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
    } 
  }

  instrumentTechnicianSelected(instrumentTechnician: Instrumentador) {
    this.selectedInstrumentTechnician = instrumentTechnician;
    this.resultsSearchigInstrumentTechnicians = [];
  }

  searchConceptTime(event: any){
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 4) {
      this.resultsSearchigConceptTimeReplacement = [];
      this.searchConceptTimeByName(query);
    } 

  }

  searchConceptTimeByName(name: string){
    this.resultsSearchigConceptTimeReplacement = this.listConceptTimeReplacement.filter((concept) => concept.name.toLowerCase().indexOf(name) > -1);
    if (this.resultsSearchigConceptTimeReplacement.length === 0) {
      this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
    } 
  }

  conceptTimeReplacementselected(conceptTimeReplacement:ConceptoTiempoRecambio){
    this.selectedConceptTimeReplacement = conceptTimeReplacement;
    this.resultsSearchigConceptTimeReplacement = [];
  }

}
