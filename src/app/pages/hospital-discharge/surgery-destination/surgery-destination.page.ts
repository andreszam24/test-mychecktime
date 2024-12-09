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
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { StatusService } from 'src/app/services/status.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-surgery-destination',
  templateUrl: './surgery-destination.page.html',
  styleUrls: ['./surgery-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class SurgeryDestinationPage implements OnInit {

  minimumSelectableDate = DateUtilsService.iso8601DateTime(new Date());
  envioCirugiaDatetime: null;
  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
    private alertService: AlertService,
    private sharedDataService: SharedDataService,
    private router: Router
  ) {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      const ordenDeSalida = sm.patientsExit.recover?.checkDate 
        ? new Date(sm.patientsExit.recover.checkDate) 
        : null;

      this.minimumSelectableDate = ordenDeSalida 
        ? DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida)) 
        : DateUtilsService.iso8601DateTime(new Date());
    });
   }

  ngOnInit() {
  }

  showMessageDateLess() {
    this.alertService.presentBasicAlert('Atención', 'Recuerda ingresar la hora real de salida o traslado de la UCPA.');
  }

  async goToNextPage() {
  
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.envioCirugiaDatetime!));
    const horaOrdenDeSalida =new Date(this.minimumSelectableDate);    

    if(horaRealdeSalida >= horaOrdenDeSalida){
      await this.loadingService.showLoadingBasic("Cargando...");

      this.medicalService.getInProgressMedicalAtenttion().then(sm => {

        sm.state = StatusService.TERMINADO;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.envioCirugiaDatetime!));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate,'yyyy-MM-dd')!;
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate,'HH:mm:ss')!;

        const patientToRebootProcess = sm.patient;

        this.medicalService.saveMedicalAttention(sm, 'sync')
          .then(result => {
            this.loadingService.dismiss();
            if (result) {
              this.sharedDataService.setDatos(patientToRebootProcess);
              this.router.navigateByUrl('/home');
            }
          }).catch(() => {
            this.loadingService.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.navigateForward('/home');            
          });
      }).catch(e => {
        console.log('Error consultando la atencion médica');
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('/home');            
      });

    }else{
        this.showMessageDateLess();
  }
  }

  isValid(): boolean {
    return !!this.envioCirugiaDatetime;
  }
}
