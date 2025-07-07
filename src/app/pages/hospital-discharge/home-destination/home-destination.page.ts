import { Component } from '@angular/core';
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
export class HomeDestinationPage {
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

  async ionViewWillEnter() {

    await this.loadingService.showLoadingBasic("Cargando...");
    try {
      const sm = await this.medicalService.getInProgressMedicalAtenttion();
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
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      this.loadingService.dismiss();
    }
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

  checkDate() {
    const horaRealdeSalida = new Date(this.model.envioDestinoHoraManual);
    this.recover.checkDate = horaRealdeSalida;
    this.recover.simpleCheckDateOrder = this.datepipe.transform(this.recover.checkDate, 'yyyy-MM-dd')!;
    this.recover.simpleCheckHourOrder = this.datepipe.transform(this.recover.checkDate, 'HH:mm:ss')!;
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
    now.setTime(now.getTime() - (10 * 60 * 1000));
    recover.checkDate = now;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate, 'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate, 'HH:mm:ss')!;

    return recover;
  }

  // Necesitamos la hora real de salida para poder guardarla en la base de datos
  
  async goToNextPage() {
    const horaRealdeSalida = new Date(this.model.envioDestinoHoraManual);
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);

    if (horaRealdeSalida > horaOrdenDeSalida) {
      await this.loadingService.showLoadingBasic("Cargando...");
      this.checkDate();

      this.medicalService.getInProgressMedicalAtenttion().then(sm => {
        if (!sm.patientsExit) {
          sm.patientsExit = new PatientsExitList();
        }
        sm.patientsExit.destination = 'CASA';
        sm.patientsExit.recover = this.recover;
        sm.patientsExit.checkDate = this.recover.checkDate;
        sm.patientsExit.simpleCheckDate = this.recover.simpleCheckDateOrder;
        sm.patientsExit.simpleCheckHour = this.recover.simpleCheckHourOrder;

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
