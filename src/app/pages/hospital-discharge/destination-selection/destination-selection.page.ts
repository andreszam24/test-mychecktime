import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PatientsExitList } from 'src/app/models/patients-exit-list.model';
import { Patient } from 'src/app/models/patient.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { StatusService } from 'src/app/services/status.service';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Recover } from 'src/app/models/recover.model';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';

@Component({
  selector: 'app-destination-selection',
  templateUrl: './destination-selection.page.html',
  styleUrls: ['./destination-selection.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class DestinationSelectionPage implements OnInit {

  model: any = {
    aldrete: null,
    bromage: null,
    ramsay: null,
    eva: null,
    nausea: null,
    destino: null,
    fechaOrdenDeSalida: null
  };

  patientExit: PatientsExitList;
  patient: Patient;

  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
  ) { 
    this.patientExit = new PatientsExitList();
  }

  ngOnInit() {
  }

  async goToNextPage() {
    this.patientExit.destination = this.model.destino;
    this.patientExit.state = StatusService.SELECCION_DESTINO;
    this.patientExit.recover = this.mapViewToModel();
    await this.loadingService.showLoadingBasic("Cargando...");

    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.patientsExit = this.patientExit;
      sm.state = this.destinationStatus();
      this.updateMedicalService(sm, this.loadingService);

    }).catch(e => {
      this.loadingService.dismiss();
      console.log('Error consultando la atencion médica',e);
    });
  }

  private mapViewToModel(): Recover {
    const recover = new Recover();
    recover.aldrete = this.numericValue(this.model.aldrete);
    recover.bromage = this.numericValue(this.model.bromage);
    recover.ramsay = this.numericValue(this.model.ramsay);
    recover.eva = this.model.eva;
    recover.nausea = this.model.nausea;
    recover.state = StatusService.TERMINADO;
    recover.checkDate = this.model.fechaOrdenDeSalida;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate,'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate,'HH:mm:ss')!;
    return recover;
  }

  private numericValue(valor: any): number {
    return valor === '' ? null : valor;
  }

  private redirectToSelectedPage(): void  {
    if(this.model.destino === 'CASA') {
      this.navCtrl.navigateForward('/home-destination');
    } else if(this.model.destino === 'HOSPITALIZACION') {
      this.navCtrl.navigateForward('/hospitalization-destination');
    } else if(this.model.destino === 'UCI') {
      this.navCtrl.navigateForward('/uci-destination');
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      this.navCtrl.navigateForward('/decease-destination');
    } else if(this.model.destino === 'CIRUGIA') {
      this.navCtrl.navigateForward('/surgery-destination');
    }
  }

  private destinationStatus(): string {
    if(this.model.destino === 'CASA') {
      return StatusService.DESTINO_CASA;
    } else if(this.model.destino === 'HOSPITALIZACION') {
      return StatusService.DESTINO_HOSPITALIZACION;
    } else if(this.model.destino === 'UCI') {
      return StatusService.DESTINO_UCI;
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      return StatusService.DESTINO_SALA_DE_PAZ;
    } else if(this.model.destino === 'CIRUGIA') {
      return StatusService.DESTINO_CIRUGIA;
    }
    return '';
  }

  private updateMedicalService(sm: MedicalAttention, loading: any) {
    this.medicalService.saveMedicalAttention(sm, 'sync')
    .then(result => {
        loading.dismiss();
        if(result) {
          this.redirectToSelectedPage();
        }
    }).catch(err => {
      loading.dismiss();
      console.error('No se pudo guardar el servicio médico',err);
    });
  }

  markDepartureOrderDate() {
    if (this.model.fechaOrdenDeSalida === null) {
      this.model.fechaOrdenDeSalida = new Date();
    }
  }

  isValid() {
    const oneOfThree = this.isSetted(this.model.bromage) || this.isSetted(this.model.ramsay) || this.isSetted(this.model.aldrete);
    return this.isSetted(this.model.eva) && oneOfThree && this.model.nausea !== null && this.model.destino;
  }

  private isSetted(valor: any) {
    return valor !== undefined && valor !== null && valor !== '';
  }

}
