import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { DateUtilsService } from 'src/app/services/utilities/date-utils.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { StatusService } from 'src/app/services/status.service';
import { USER_KEY } from 'src/app/services/auth.service';
import { Recover } from 'src/app/models/recover.model';
import { PatientsExitList } from 'src/app/models/patients-exit-list.model';


@Component({
  selector: 'app-home-destination',
  templateUrl: './home-destination.page.html',
  styleUrls: ['./home-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent, ButtonPanelComponent]
})
export class HomeDestinationPage implements OnInit {

  minimumSelectableDate = DateUtilsService.iso8601DateTime(new Date());
  datepipe = new DatePipe('en-US');
  model: any = {
    description: null,
    envioDestinoHoraManual: null
  };
  dataUser: any;
  recover: Recover = new Recover();
  constructor(
    private readonly navCtrl: NavController,
    private readonly loadingService: LoadingService,
    private readonly medicalService: InProgressMedicalAttentionService,
    private readonly alertService: AlertService
  ) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.medicalService.getInProgressMedicalAtenttion().then(sm => {
      if (!sm.patientsExit) {
        sm.patientsExit = new PatientsExitList();
      }
      if (!sm.patientsExit.recover) {
        sm.patientsExit.recover = new Recover();
      }
      if (this.idRole) {
        this.recover = this.addDummyDataToRecoveryDischarge();
        sm.patientsExit.recover = this.recover;
      }
      const ordenDeSalida = new Date(sm.patientsExit.recover.checkDate);
      this.minimumSelectableDate = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida));
    });
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  isValid(): boolean {
    if (!this.model.envioDestinoHoraManual) {
      return false
    }
    return true
  }

  showMessageDateLess() {
    this.alertService.presentBasicAlert('Atención', 'Recuerda ingresar la hora real de salida o traslado de la UCPA.');
  }

  addDummyDataToRecoveryDischarge(): Recover {
    const recover = new Recover();
    recover.aldrete = -1;
    recover.bromage = -1;
    recover.ramsay = -1;
    recover.eva = -1;
    recover.nausea = false;
    recover.state = StatusService.TERMINADO;
    const now = new Date();
    now.setSeconds(now.getSeconds() - 60);
    recover.checkDate = now;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate, 'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate, 'HH:mm:ss')!;
    return recover;
  }

  async goToNextPage() {
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);

    if (horaRealdeSalida > horaOrdenDeSalida) {
      await this.loadingService.showLoadingBasic("Cargando...");

      this.medicalService.getInProgressMedicalAtenttion().then(sm => {
        if (!sm.patientsExit) {
          sm.patientsExit = new PatientsExitList();
          sm.patientsExit.destination = 'CASA';
        }
        sm.patientsExit.recover = this.recover;
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate, 'yyyy-MM-dd')!;
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate, 'HH:mm:ss')!;

        sm.patientsExit.description = this.model.description;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.state = StatusService.TERMINADO;

        this.medicalService.saveMedicalAttention(sm, 'sync')
          .then(result => {
            this.loadingService.dismiss();
            if (result) {
              this.navCtrl.navigateForward('home');
            }
          }).catch(() => {
            this.loadingService.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.navigateForward('home');
          });
      }).catch((e) => {
        console.error('Error consultando la atencion médica', e);
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('home');
      });
    } else {
      this.showMessageDateLess();
    }
  }
}
