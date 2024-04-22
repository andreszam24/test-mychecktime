import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { DateUtilsService } from 'src/app/services/utilities/date-utils.service';
import { UCI } from 'src/app/models/uci.model';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-uci-destination',
  templateUrl: './uci-destination.page.html',
  styleUrls: ['./uci-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class UCIDestinationPage implements OnInit {

  minimumSelectableDate = DateUtilsService.iso8601DateTime(new Date());
  uci: UCI;
  datepipe = new DatePipe('en-US');

  model: any = {
    recieveName: null,
    description: null,
    envioDestinoHoraManual: null
  };


  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
    private alertService: AlertService
  ) {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      const ordenDeSalida = new Date(sm.patientsExit.recover.checkDate);
      this.minimumSelectableDate = DateUtilsService.iso8601DateTime(DateUtilsService.toColombianOffset(ordenDeSalida));
    });
   }

  ngOnInit() {
  }

  showMessageDateLess() {
    this.alertService.presentBasicAlert('Atención', 'Recuerda ingresar la hora real de salida o traslado de la UCPA.');
  }

  async goToNextPage() {
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);    

    if(horaRealdeSalida > horaOrdenDeSalida){
      
      await this.loadingService.showLoadingBasic("Cargando...");
      this.mapViewToModel();
      this.medicalService.getInProgressMedicalAtenttion().then( sm => {
        sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
        sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate,'yyyy-MM-dd')!;
        sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate,'HH:mm:ss')!;

        sm.patientsExit.uci = this.uci;
        sm.patientsExit.state = StatusService.TERMINADO;
        sm.state = StatusService.TERMINADO;

        this.medicalService.saveMedicalAttention(sm, 'sync')
          .then(result => {
            this.loadingService.dismiss();
            if(result) {
              this.navCtrl.navigateForward('home');            
            }
          }).catch(() => {
            this.loadingService.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.navigateForward('home');            
          });
      }).catch(() => {
        console.log('Error consultando la atencion médica');
        this.loadingService.dismiss();
        this.navCtrl.navigateForward('home');            
      });
      
    }else{
      this.showMessageDateLess();
  }
  }

  private mapViewToModel(): UCI {
    this.uci.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.model.envioDestinoHoraManual));
    this.uci.simpleCheckDate = this.datepipe.transform(this.uci.checkDate,'yyyy-MM-dd')!;
    this.uci.simpleCheckHour = this.datepipe.transform(this.uci.checkDate,'HH:mm:ss')!;
    
    this.uci.recieveName = this.model.recieveName;
    this.uci.description = this.model.description;
    this.uci.state = StatusService.TERMINADO;
    return this.uci;
  }

  isValid() {
    let valid = true;
    for (var property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if(!(!!this.model[property])) {
          valid = false;
        }
      }
    }
    return valid;
  }
}
