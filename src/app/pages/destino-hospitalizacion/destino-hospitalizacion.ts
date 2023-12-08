import { Component } from '@angular/core';
import { NavController, MenuController, LoadingController, AlertController } from 'ionic-angular';

import { InProgressMedicalAttention } from './../../../app/services/in-progress-medical-attention.service';

import { StatusService } from './../../../app/services/status.service';
import { SeleccionarPacientePage } from './../../seleccionar-paciente/seleccionar-paciente';
import { DateUtilsService } from '../../../app/services/date-utils.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'destino-hospitalizacion-page',
  templateUrl: 'destino-hospitalizacion.html'
})
export class DestinoHospitalizacionPage {

  fechaMinimaSeleccionable = DateUtilsService.iso8601DateTime(new Date());

  hospitalizacionDatetime: null;

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
    
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.hospitalizacionDatetime));
    const horaOrdenDeSalida = new Date(this.fechaMinimaSeleccionable);    

    if(horaRealdeSalida > horaOrdenDeSalida){
      
      const loading = this.showLoading();
      this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
          
          sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.hospitalizacionDatetime));
          sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate,'yyyy-MM-dd');
          sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate,'HH:mm:ss');

          sm.patientsExit.state = StatusService.TERMINADO;
          sm.state = StatusService.TERMINADO;

          this.inProgressRepository.saveMedicalAttention(sm, 'sync')
            .then(result => {
                loading.dismiss();
                if(result) {
                  this.navCtrl.setRoot(SeleccionarPacientePage);
                }
            }).catch(() => {
                loading.dismiss();
                console.error('No se pudo guardar el servicio médico');
                this.navCtrl.setRoot(SeleccionarPacientePage);
              });
        }).catch(() => {
          console.log('Error consultando la atencion médica');
          loading.dismiss();
          this.navCtrl.setRoot(SeleccionarPacientePage);
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
    return !!this.hospitalizacionDatetime;
  }
}
