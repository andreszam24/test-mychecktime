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

@Component({
  selector: 'app-hospitalization-destination',
  templateUrl: './hospitalization-destination.page.html',
  styleUrls: ['./hospitalization-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent, ButtonPanelComponent]
})
export class HospitalizationDestinationPage implements OnInit {

  minimumSelectableDate = DateUtilsService.iso8601DateTime(new Date());
  hospitalizacionDatetime: string | null = null;
  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
    private alertService: AlertService
  ) { 
    this.medicalService.getInProgressMedicalAtenttion().then(sm => {
      const ordenDeSalida = sm.patientsExit.recover?.checkDate 
        ? new Date(sm.patientsExit.recover.checkDate) 
        : null;

      this.minimumSelectableDate = ordenDeSalida 
        ? DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida)) 
        : DateUtilsService.iso8601DateTime(new Date());
    }).catch(() => {
      console.error('Error al obtener la atención médica en progreso');
    });
  }

  ngOnInit() { }

  // Mostrar alerta si la fecha seleccionada es menor que la fecha mínima
  showMessageDateLess() {
    this.alertService.presentBasicAlert('Atención', 'Recuerda ingresar la hora real de salida o traslado de la UCPA.');
  }

  // Validar y guardar los datos al continuar
  async goToNextPage() {
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.hospitalizacionDatetime!));
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);

    // Validar que la hora seleccionada sea mayor a la fecha mínima
    if (horaRealdeSalida >= horaOrdenDeSalida) {
      await this.loadingService.showLoadingBasic("Cargando...");
      
      this.medicalService.getInProgressMedicalAtenttion().then(sm => {
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.hospitalizacionDatetime!));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate, 'yyyy-MM-dd')!;
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate, 'HH:mm:ss')!;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.state = StatusService.TERMINADO;

        this.medicalService.saveMedicalAttention(sm, 'sync')
          .then(result => {
            this.loadingService.dismiss();
            if (result) {
              this.navCtrl.navigateForward('home');
            }
          })
          .catch(() => {
            this.loadingService.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.navigateForward('home');
          });
      }).catch(() => {
        this.loadingService.dismiss();
        console.error('Error consultando la atención médica');
        this.navCtrl.navigateForward('home');
      });
    } else {
      this.showMessageDateLess();
    }
  }

  // Método para habilitar/deshabilitar el botón de finalizar
  isValid(): boolean {
    return !!this.hospitalizacionDatetime;
  }
}
