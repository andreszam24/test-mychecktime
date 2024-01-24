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
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { StatusService } from 'src/app/services/status.service';
import { AuthService } from 'src/app/services/auth.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { Toast } from '@capacitor/toast';
import { AlertController, Platform, IonAlert } from '@ionic/angular/standalone';




@Component({
  selector: 'app-operating-room-list',
  templateUrl: './operating-room-list.page.html',
  styleUrls: ['./operating-room-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent]
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
  
  conceptoSeleccionadoTiempoRecambio: ConceptoTiempoRecambio = new ConceptoTiempoRecambio();
  listSurgeons: Cirujano[] = [];
  selectedSurgeon: Cirujano = new Cirujano();
  listInstrumentTechnicians: Instrumentador[] = [];
  selectedInstrumentTechnician: Instrumentador = new Instrumentador();
  
  mostrarBusquedaConceptos = false;

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
    this.getListOfSurgeons();
    this.getListOfInstrumentTechnicians();
    this.getListConceptTimeReplacement();
  }

ngOnInit() {
    
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


  private getListOfSurgeons(){
    this.listSurgeons = this.surgeonService.getLocalSurgeons();
    if(this.listSurgeons.length == 0){
      this.surgeonService.getListOfSurgeons()
      .pipe(
        catchError((err, caught) => {
          console.error('Ocurrió un error cargando la lista de cirujanos ', err, caught);
          return of([]);        
        })
      )
      .subscribe(
        listSurgeons => {
          this.listSurgeons = listSurgeons;
        }
      );
    }
  }

  private getListOfInstrumentTechnicians(){
    this.listInstrumentTechnicians = this.instrumentTechnicianService.getLocalInstrumentTechnicians();
    if(this.listInstrumentTechnicians.length == 0){
      this.instrumentTechnicianService.getListOfInstrumentTechnicians()
      .pipe(
        catchError((err, caught) => {
          console.error('Ocurrió un error cargando la lista de cirujanos ', err, caught);
          return of([]);        
        })
      )
      .subscribe(
        listInstrumentTechnicians => {
          this.listInstrumentTechnicians = listInstrumentTechnicians;
        }
      );
    }
  }

  private getListConceptTimeReplacement(){
    this.listConceptTimeReplacement = this.conceptTimeReplacementService.getLocalConceptTimeReplacement();
    if(this.listConceptTimeReplacement.length == 0){
      this.conceptTimeReplacementService.getListConceptTimeReplacement()
      .pipe(
        catchError((err, caught) => {
          console.error('Ocurrió un error cargando la lista de cirujanos ', err, caught);
          return of([]);        
        })
      )
      .subscribe(
        listConceptTimeReplacement => {
          this.listConceptTimeReplacement = listConceptTimeReplacement;
        }
      );
    }
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
    this.showAlertTimeReplacement();
    } else {
      this.goToNextPage();
    }
  }

  showAlertTimeReplacement() {
    this.recambio = new Recambio();
    let loading = this.showLoading();
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {      
      this.parametersTimeCalculation.idAnes = sm.currentAnesthesiologist.id;
      this.parametersTimeCalculation.idOperatingRoom = sm.idOperatingRoom;
      this.parametersTimeCalculation.operatingRoomDate = this.operatingRoomList.checkDate.toISOString();

      this.medicalService.calculateChangePatientTime(this.parametersTimeCalculation).subscribe(
        res => {
          if(res !== null) {
            loading.dismiss();
              this.recambio.elapsedTime = res.replace(/"/g, "");
              this.mostrarAlerta(this.recambio.elapsedTime);
            }
        },e => {
          
          loading.dismiss(); 
          if(e.status !== undefined && e.status === 401 && AuthService.getAuthToken() != null){
            this.showAlertTimeReplacement();
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

  private mostrarAlerta(changeTime: string) {
    /*let alert = this.alertCtrl.create({
      message: '¿El tiempo de recambio es de ' + changeTime + ' (Días:Horas:Minutos:Segundos)?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => this.procesarRespuestaRecambio(false)
        },
        {
          text: 'Si',
          handler: () => this.procesarRespuestaRecambio(true)
        }
      ]
    });
    alert.present();*/
  }

 /* async showOptionsModal(msg: string): Promise<boolean> {
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
*/

 private procesarRespuestaRecambio(accepted: boolean) {
    this.recambio.accepted = accepted;
    const time = this.recambio.elapsedTime.split(":");
    
    if(!accepted || parseInt(time[0]) > 0 || parseInt(time[1]) > 0 || parseInt(time[2]) > 30) {
      this.mostrarBusquedaConceptos = true;
    } else {
      this.goToNextPage();
    }
  }

  procesarJustificacion() {
    if(!!this.conceptoSeleccionadoTiempoRecambio && !!this.conceptoSeleccionadoTiempoRecambio.name) {
      this.recambio.conceptoRecambio = this.conceptoSeleccionadoTiempoRecambio;
      this.goToNextPage();
    }
  }

  checkDate() {
    this.operatingRoomList.checkDate = new Date();
    this.operatingRoomList.simpleCheckDate = this.datepipe.transform(this.operatingRoomList.checkDate,'yyyy-MM-dd')!;
    this.operatingRoomList.simpleCheckHour = this.datepipe.transform(this.operatingRoomList.checkDate,'HH:mm:ss')!;
  }

  goToNextPage(){
    const operatingRoomList = this.mapViewToModel();
    
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.surgeon = this.selectedSurgeon;
      sm.instrumentator = this.selectedInstrumentTechnician;

      sm.operatingRoomList = operatingRoomList;
      sm.state = StatusService.OPERATING_ROOM_LIST;

      this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              this.navCtrl.navigateForward('AnestesiaQuirofanoPage');
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

  private showErrorToast(msg: string) {
    Toast.show({
      text:msg,
      duration: "long",
      position: "bottom"
    });
  }

  private showLoading(): any {
    this.loadingService.showLoadingBasic("Cargando...");
  }

 /*conceptoSelected(event: { component: SelectSearchable, value: any }) {
    const concepto : ConceptoTiempoRecambio = JSON.parse(JSON.stringify(event.value.value));
    this.conceptoSeleccionadoTiempoRecambio = concepto;
  }

  cirujanoSelected(event: { component: SelectSearchable, value: any }) {
    const cirujano : Cirujano = JSON.parse(JSON.stringify(event.value.value));
    this.cirujanoSeleccionado = cirujano;
  }

  instrumentadorSelected(event: { component: SelectSearchable, value: any }) {
    const instrumentador : Instrumentador = JSON.parse(JSON.stringify(event.value.value));
    this.instrumentadorSeleccionado = instrumentador;
  }

  searchConceptoTemplate(concepto: any) {
    
    return `${concepto.value.name}`;
  }

  searchCirujanoTemplate(cirujano: any) {
    
    return `${cirujano.value.name} ${cirujano.value.lastname}`;
  }

  searchInstrumentadorTemplate(instrumentador: any) {
    
    return `${instrumentador.value.name} ${instrumentador.value.lastname}`;
  }

  searchCirujanos(event: { component: SelectSearchable, text: string }) {
    let text = (event.text || '').trim().toLowerCase();
    
    if (!text) {
        event.component.items = [];
        return;
    } else if (text.length < 3) {
        return;
    }

    event.component.isSearching = true;

    let p = this.cirujanoService.searchByName(text);
    event.component.items = p as any;
    event.component.isSearching = false;
    
  }

  searchInstrumentadores(event: { component: SelectSearchable, text: string }) {
    let text = (event.text || '').trim().toLowerCase();
    
    if (!text) {
        event.component.items = [];
        return;
    } else if (text.length < 3) {
        return;
    }

    event.component.isSearching = true;

    let p = this.instrumentadorService.searchByName(text);
    event.component.items = p as any;
    event.component.isSearching = false;
    
  }

  searchConceptos(event: { component: SelectSearchable, text: string }) {
    let text = (event.text || '').trim().toLowerCase();
    
    if (!text) {
        event.component.items = [];
        return;
    } else if (text.length < 3) {
        return;
    }

    event.component.isSearching = true;

    let p = this.conceptoTiempoRecambioService.searchByName(text);
    event.component.items = p as any;
    event.component.isSearching = false;
  
  }*/

}
