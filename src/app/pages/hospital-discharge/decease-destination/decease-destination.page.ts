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
  selector: 'app-decease-destination',
  templateUrl: './decease-destination.page.html',
  styleUrls: ['./decease-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class DeceaseDestinationPage implements OnInit {

  minimumSelectableDate = DateUtilsService.iso8601DateTime(new Date());
  fallecimientoHoraManual: null;
  datepipe = new DatePipe('en-US');


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
    
    const horaRealdeSalida = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.fallecimientoHoraManual!));
    const horaOrdenDeSalida = new Date(this.minimumSelectableDate);    

    if(horaRealdeSalida > horaOrdenDeSalida){

      await this.loadingService.showLoadingBasic("Cargando...");
        this.medicalService.getInProgressMedicalAtenttion().then( sm => {
          sm.patientsExit.decease = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.fallecimientoHoraManual!));
          sm.patientsExit.checkDate = DateUtilsService.toUTC(DateUtilsService.stringDate2Date(this.fallecimientoHoraManual!));
          
          sm.patientsExit.simpleCheckDate = this.datepipe.transform(sm.patientsExit.checkDate,'yyyy-MM-dd')!;
          sm.patientsExit.simpleCheckHour = this.datepipe.transform(sm.patientsExit.checkDate,'HH:mm:ss')!;

          sm.patientsExit.simpleDeceaseDate = this.datepipe.transform(sm.patientsExit.decease,'yyyy-MM-dd')!;
          sm.patientsExit.simpleDeceaseHour = this.datepipe.transform(sm.patientsExit.decease,'HH:mm:ss')!;

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

  isValid(): boolean {
    return !!this.fallecimientoHoraManual;
  }

}
