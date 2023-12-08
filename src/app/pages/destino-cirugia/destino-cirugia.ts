/*import { Component } from '@angular/core';
import { NavController, MenuController, LoadingController, AlertController } from 'ionic-angular';

import { InProgressMedicalAttention } from './../../../app/services/in-progress-medical-attention.service';

import { StatusService } from './../../../app/services/status.service';
import { DateUtilsService } from '../../../app/services/date-utils.service';
import { AdicionarPacientePage } from '../../adicionar-paciente/adicionar-paciente';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'destino-cirugia-page',
  templateUrl: 'destino-cirugia.html'
})
export class DestinoCirugiaPage {

  fechaMinimaSeleccionable = DateUtilsService.iso8601DateTime(new Date());

  envioCirugiaDatetime: null;

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private inProgressRepository: InProgressMedicalAttention,
    public datepipe: DatePipe) {
    
    this.menu.enable(true, 'menu-anestesia');

    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      const ordenDeSalida = new Date(sm.patientsExit.recover.checkDate);
      this.fechaMinimaSeleccionable = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida));
    });
  }

  showMessageDateLess() {
    let alert = this.alertCtrl.create({
      title: 'Atención',
      subTitle: 'Recuerda ingresar la hora real de salida o traslado de la UCPA.',
      buttons: ['OK']
    });
    alert.present();
  }

  goToNextPage() {
  
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.envioCirugiaDatetime));
    const horaOrdenDeSalida =new Date(this.fechaMinimaSeleccionable);    

    if(horaRealdeSalida > horaOrdenDeSalida){
      const loading = this.showLoading();

      this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {

        sm.state = StatusService.TERMINADO;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.envioCirugiaDatetime));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate,'yyyy-MM-dd');
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate,'HH:mm:ss');

        const patientToRebootProcess = sm.patient;

        this.inProgressRepository.saveMedicalAttention(sm, 'sync')
          .then(result => {
            loading.dismiss();
            if (result) {
              this.navCtrl.push(AdicionarPacientePage, { "paciente": patientToRebootProcess });
            }
          }).catch(() => {
            loading.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.setRoot(AdicionarPacientePage);
          });
      }).catch(e => {
        console.log('Error consultando la atencion médica');
        loading.dismiss();
        this.navCtrl.setRoot(AdicionarPacientePage);
      });

    }else{
        this.showMessageDateLess();
  }
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

  isValid(): boolean {
    return !!this.envioCirugiaDatetime;
  }
}*/
