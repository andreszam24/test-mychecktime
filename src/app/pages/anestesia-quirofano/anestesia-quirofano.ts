/*import { Component } from '@angular/core';


import { CkeckeoSalidaQuirofanoPage } from './../checkeo-salida-quirofano/checkeo-salida-quirofano';
import { DatePipe } from '@angular/common';
import { MenuController, NavController } from '@ionic/angular';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { MedicalAttention } from 'src/app/models/medical-attention.model';

@Component({
  selector: 'page-anestesia-quirofano',
  templateUrl: 'anestesia-quirofano.html'
})
export class AnestesiaQuirofanoPage {

  eventoCancelarVisible: boolean = false;

  currentServiceStatus: string;

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private medicalService: InProgressMedicalAttentionService,
    public datepipe: DatePipe) {
    
      this.validarSiEventoCancelarVisible();

      this.medicalService.getInProgressMedicalAtenttion().then(sm => {
        this.currentServiceStatus = sm.state;
      }).catch(() => console.error('Error consultando el servicio médico'));
  }

  private validarSiEventoCancelarVisible() {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      // TODO: Validar regla de negocio
      if(StatusService.isAtLeast('StartAnesthesia', sm.state)) {
        this.eventoCancelarVisible = true;
        this.menu.enable(true, 'menu-anestesia');
      }
    }).catch(e => Promise.reject(e));
  }
  
  goToInicoAnestesia() {
    this.habilitarMenu();
    this.inhabilitarOpcionEventoCancelar();

    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.startAnesthesia = new Date();
      sm.operatingRoomList.simpleStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'yyyy-MM-dd') ?? '';
      sm.operatingRoomList.simpleStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'HH:mm:ss') ?? '';

      sm.operatingRoomList.status = StatusService.START_ANESTHESIA;
      sm.state = StatusService.START_ANESTHESIA;
    }

    this.checkItemAndSave(check, () => {});
  }

  private habilitarMenu() {
    this.menu.enable(true, 'menu-anestesia');
    this.menu.open();
  }

  private inhabilitarOpcionEventoCancelar() {
    this.eventoCancelarVisible = false;
  }

  goToFinInicioAnestesia() {
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.endStartAnesthesia = new Date();
      sm.operatingRoomList.simpleEndStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'yyyy-MM-dd') ?? '';
      sm.operatingRoomList.simpleEndStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'HH:mm:ss') ?? '';
      
      sm.operatingRoomList.status = StatusService.END_START_ANESTHESIA;
      sm.state = StatusService.END_START_ANESTHESIA;
    }

    this.checkItemAndSave(check, () => {});
  }

  goToIncisionQuirurgica() {
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.startSurgery = new Date();
      sm.operatingRoomList.simpleStartSurgeryDate = this.datepipe.transform(sm.operatingRoomList.startSurgery,'yyyy-MM-dd') ?? '';
      sm.operatingRoomList.simpleStartSurgeryHour = this.datepipe.transform(sm.operatingRoomList.startSurgery,'HH:mm:ss') ?? '';
      
      sm.operatingRoomList.status = StatusService.START_SURGERY;
      sm.state = StatusService.START_SURGERY;
    }

    this.checkItemAndSave(check, () => {});
  }

  goToFinCirugia() {
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.endSurgery = new Date();
      sm.operatingRoomList.simpleEndSurgeryDate = this.datepipe.transform(sm.operatingRoomList.endSurgery,'yyyy-MM-dd') ?? '';
      sm.operatingRoomList.simpleEndSurgeryHour = this.datepipe.transform(sm.operatingRoomList.endSurgery,'HH:mm:ss') ?? '';

      sm.operatingRoomList.status = StatusService.TERMINADO;
      sm.state = StatusService.END_SUGERY;
    }

    const success = () => this.navCtrl.navigateForward('pages/chec');

    this.checkItemAndSave(check, success);
  }

  private checkItemAndSave( checkFn: ( s :MedicalAttention) => void , success: () => void): void {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      
      if(!(!!sm.operatingRoomList)) {
        this.navCtrl.pop();
        return;
      }

      checkFn(sm);

      this.medicalService.saveMedicalAttention(sm,'nosync')
        .then(result => {
            if(result) {
              this.currentServiceStatus = sm.state;
              success();
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion medica'));
  }

  color(searchedStatus: string): string {
    if(StatusService.nextStatus(this.currentServiceStatus) === searchedStatus) {
      return 'app-yellow';
    }

    if(StatusService.isAtLeast(searchedStatus, this.currentServiceStatus)) {
      return 'app-blue';
    } else {
      return 'app-gray';
    }
  }

  disabled(searchedStatus: string): boolean {
    return StatusService.nextStatus(this.currentServiceStatus) !== searchedStatus;
  }
  
}
*/