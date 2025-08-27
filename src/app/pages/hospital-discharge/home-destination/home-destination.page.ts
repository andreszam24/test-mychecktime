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
      // Ya no necesitamos crear datos dummy para idRole = 4
      // porque ahora se guardan los datos reales en recovery.page.ts
      // if (this.idRole) {
      //   this.recover = this.addDummyDataToRecoveryDischarge();
      //   sm.patientsExit.recover = this.recover;
      // }
              const ordenDeSalida = new Date(sm.patientsExit.recover.checkDate);
        console.log('🔄 === HOME-DESTINATION - LEYENDO DATOS ===');
        console.log('📊 sm.patientsExit.recover:', sm.patientsExit.recover);
        console.log('📅 ordenDeSalida original:', ordenDeSalida);
        console.log('⏰ simpleCheckHourOrder:', sm.patientsExit.recover.simpleCheckHourOrder);
        console.log('⏰ simpleCheckDateOrder:', sm.patientsExit.recover.simpleCheckDateOrder);
        console.log('🔄 === FIN LEYENDO DATOS ===');
      
      // La hora mínima debe ser 1 minuto después de la orden de salida
      const horaMinima = new Date(sm.patientsExit.recover.checkDate);
      horaMinima.setMinutes(horaMinima.getMinutes() + 1);
      
      this.minimumSelectableDate = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(horaMinima));
      console.log('📅 horaMinima (1 minuto después):', horaMinima);
      console.log('📅 minimumSelectableDate:', this.minimumSelectableDate);
      console.log('🔄 === FIN ionViewWillEnter ===');
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
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
    this.alertService.presentBasicAlert(
      'Atención', 
      'La fecha y hora de salida debe ser posterior a la orden de salida. Por favor, selecciona una fecha y hora válida.'
    );
  }

  checkDate() {
    // Este método ya no es necesario para modificar recover.checkDate
    // ya que recover.checkDate debe mantener la fecha de orden de salida
    // La hora real de salida se maneja directamente en goToNextPage()
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
    recover.checkDate = now;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate, 'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate, 'HH:mm:ss')!;

    return recover;
  }

  // Necesitamos la hora real de salida para poder guardarla en la base de datos
  
  async goToNextPage() {
    const horaRealdeSalida = new Date(this.model.envioDestinoHoraManual);
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);

    console.log('📊 === VALIDACIÓN FECHA/HORA ===');
    console.log('📅 Fecha/Hora seleccionada por usuario:', horaRealdeSalida);
    console.log('📅 Fecha/Hora mínima permitida:', horaOrdenDeSalida);
    console.log('✅ ¿Es válida?', horaRealdeSalida >= horaOrdenDeSalida);
    console.log('📊 === FIN VALIDACIÓN ===');

    // Validar que la fecha y hora seleccionada sea posterior a la orden de salida
    if (horaRealdeSalida >= horaOrdenDeSalida) {
      await this.loadingService.showLoadingBasic("Cargando...");

      this.medicalService.getInProgressMedicalAtenttion().then(sm => {
        if (!sm.patientsExit) {
          sm.patientsExit = new PatientsExitList();
        }
        if (!sm.patientsExit.recover) {
          sm.patientsExit.recover = new Recover();
        }
        
        sm.patientsExit.destination = 'CASA';
        // Preservar el recover existente - NO modificarlo
        
        // Hora real de salida (punto 10) - se guarda en patientsExit.checkDate
        sm.patientsExit.checkDate = horaRealdeSalida;
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(horaRealdeSalida, 'yyyy-MM-dd')!;
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(horaRealdeSalida, 'HH:mm:ss')!;

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
