/*import { ParametersTimeCalculation } from './../../app/models/parameters-time-calculation.model';
import { AnestesiaQuirofanoPage } from './../anestesia-quirofano/anestesia-quirofano';
import { Component } from '@angular/core';

import { NavController, ToastController, AlertController, LoadingController } from 'ionic-angular';

import { InProgressMedicalAttention } from './../../app/services/in-progress-medical-attention.service';
import { StatusService } from './../../app/services/status.service';
import { SelectSearchable } from './../../components/select-searchable/select-searchable';

import { OperatingRoomList } from './../../app/models/operating-room-list.model';
import { Recambio } from './../../app/models/recambio.model';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../app/services/auth.service';
import { ConceptoTiempoRecambioService } from '../../app/services/concepto-tiempo-recambio.service';
import { ConceptoTiempoRecambio } from '../../app/models/concepto-tiempo-recambio.model';
import { Cirujano } from '../../app/models/cirujano.model';
import { CirujanoService } from '../../app/services/cirujano.service';
import { Instrumentador } from '../../app/models/instrumentador.model';
import { InstrumentadorService } from '../../app/services/instrumentador.service';


@Component({
  selector: 'lista-quirofano-page',
  templateUrl: 'lista-quirofano.html'
})
export class ListaQuirofanoPage {

  operatingRoomList: OperatingRoomList;
  recambio: Recambio;
  parametersTimeCalculation = new ParametersTimeCalculation();
  isChangePatientTime=true;
  listaConceptosTiempoRecambio: ConceptoTiempoRecambio[] = [];
  conceptoSeleccionadoTiempoRecambio: ConceptoTiempoRecambio = new ConceptoTiempoRecambio();

  listaCirujanos: Cirujano[] = [];
  cirujanoSeleccionado: Cirujano = new Cirujano();
  listaInstrumentadores: Instrumentador[] = [];
  instrumentadorSeleccionado: Instrumentador = new Instrumentador();
  
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

  constructor(
    private navCtrl: NavController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private medicalService: InProgressMedicalAttention,
    private conceptoTiempoRecambioService: ConceptoTiempoRecambioService,
    private cirujanoService: CirujanoService,
    private instrumentadorService: InstrumentadorService,
    public datepipe: DatePipe) {

      this.operatingRoomList = new OperatingRoomList();
      this.obtenerListaCirujanos();
      this.obtenerListaInstrumentadores();
      this.obtenerListaConceptosTiempoRecambio();
  }

  private obtenerListaCirujanos(){
    this.listaCirujanos = this.cirujanoService.getLocalCirujanos();
    if(this.listaCirujanos.length == 0){
      this.cirujanoService.obtenerListaCirujanos()
      .subscribe(
        listCirujanos => {
          this.listaCirujanos = listCirujanos;
        }
      ,e => {
          console.log('LISTA QUIROFANO : Ocurrió un error cargando la lista de cirujanos');
        });
    }
  }

  private obtenerListaInstrumentadores() {
    this.listaInstrumentadores = this.instrumentadorService.getLocalInstrumentadores();
    if(this.listaInstrumentadores.length == 0){
      this.instrumentadorService.obtenerListaInstrumentadores()
      .subscribe(
        listInstrumentadores => {
          this.listaInstrumentadores = listInstrumentadores;
        }
      ,e => {
          console.log('LISTA QUIROFANO : Ocurrió un error cargando la lista de instrumentadores');
        });
    }
  }

  private obtenerListaConceptosTiempoRecambio(){
    this.listaConceptosTiempoRecambio = this.conceptoTiempoRecambioService.getLocalConceptosTiempoRecambio();
    if(this.listaConceptosTiempoRecambio.length == 0){
      this.conceptoTiempoRecambioService.obtenerListaConceptosTiempoRecambio()
      .subscribe(
        listConceptosTiempoRecambio => {
          this.listaConceptosTiempoRecambio = listConceptosTiempoRecambio;
        }
      ,e => {
          console.log('LISTA QUIROFANO : Ocurrió un error cargando la lista de conceptos tiempo de recambio');
        });
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
    if (!this.cirujanoSeleccionado.name || !this.instrumentadorSeleccionado.name){
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
          if(e.status !== undefined && e.status === 401 && AuthService.getToken() != null){
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

  private mostrarAlerta(changeTime: string) {
    let alert = this.alertCtrl.create({
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
    alert.present();
  }

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
    this.operatingRoomList.simpleCheckDate = this.datepipe.transform(this.operatingRoomList.checkDate,'yyyy-MM-dd');
    this.operatingRoomList.simpleCheckHour = this.datepipe.transform(this.operatingRoomList.checkDate,'HH:mm:ss');
  }

  goToNextPage() {
    const operatingRoomList = this.mapViewToModel();
    
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.surgeon = this.cirujanoSeleccionado;
      sm.instrumentator = this.instrumentadorSeleccionado;

      sm.operatingRoomList = operatingRoomList;
      sm.state = StatusService.OPERATING_ROOM_LIST;

      this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              this.navCtrl.push(AnestesiaQuirofanoPage);
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
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }

  private showLoading(): any {
    let loading = this.loadingCtrl.create({
      spinner: 'circles',
      content: 'Cargando ...',
      dismissOnPageChange: true
    });

    loading.present();
    return loading;
  }

  conceptoSelected(event: { component: SelectSearchable, value: any }) {
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
    
  }

}*/
