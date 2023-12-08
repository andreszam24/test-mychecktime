/*import { Component } from '@angular/core';
import { NavController, MenuController, LoadingController, AlertController } from 'ionic-angular';

import { InProgressMedicalAttention } from './../../../app/services/in-progress-medical-attention.service';
import { SeleccionarPacientePage } from './../../seleccionar-paciente/seleccionar-paciente';

import { StatusService } from './../../../app/services/status.service';
import { DateUtilsService } from '../../../app/services/date-utils.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'destino-casa-page',
  templateUrl: 'destino-casa.html'
})
export class DestinoCasaPage {

  fechaMinimaSeleccionable = DateUtilsService.iso8601DateTime(new Date());

  model: any = {
    description: null,
    envioDestinoHoraManual: null
  };

  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private inProgressRepository: InProgressMedicalAttention,
    public datepipe: DatePipe) {

    this.menu.enable(true, 'menu-anestesia');

    this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
      console.log('orden salida: ', new Date(sm.patientsExit.recover.checkDate));
      const ordenDeSalida = new Date(sm.patientsExit.recover.checkDate);
      this.fechaMinimaSeleccionable = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida));
    });
  }

  isValid(): boolean {
    return !!this.model.description && !!this.model.envioDestinoHoraManual;
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

    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
    const horaOrdenDeSalida = new Date(this.fechaMinimaSeleccionable);

    if (horaRealdeSalida > horaOrdenDeSalida) {
      const loading = this.showLoading();

      this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate, 'yyyy-MM-dd');
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate, 'HH:mm:ss');

        sm.patientsExit.description = this.model.description;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.state = StatusService.TERMINADO;

        this.inProgressRepository.saveMedicalAttention(sm, 'sync')
          .then(result => {
            loading.dismiss();
            if (result) {
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
    } else {
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

}
*/