import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { IonicModule, NavController } from '@ionic/angular';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { MedicalEvent } from 'src/app/models/medical-event.model';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-cancellation',
  templateUrl: './cancellation.page.html',
  styleUrls: ['./cancellation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CancellationPage implements OnInit {

  model = {
    responsable: null,
    descripcion: null
  };

  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private inProgressRepository: InProgressMedicalAttentionService,
    private loadingService: LoadingService,
  ) { }

  ngOnInit() {
  }

  goToBackPage(){
    this.navCtrl.back()
  }


  toContinue() {
    if(!this.validateForm())  {
      return;
    }

    const event = this.mapViewToModel();
    this.loadingService.showLoadingBasic("Cargando...");
    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      const events = sm.events || [];
      events.push(event);
      sm.events = events;

      sm.state = StatusService.CANCELADO;

      this.inProgressRepository.saveMedicalAttention(sm,'nosync')
        .then(result => {
            if(result) {
              this.navCtrl.navigateRoot('/home');
            }
            this.loadingService.dismiss();
          }).catch(err => {
            console.error('No se pudo guardar el servicio médico',err);
            this.loadingService.dismiss();
            this.navCtrl.navigateRoot('/home');
          });
    }).catch(e => {
      console.log('Error consultando la atencion médica',e);
      this.loadingService.dismiss();
      this.navCtrl.navigateRoot('/home');
    });
  }

  private mapViewToModel(): MedicalEvent {
    const event = new MedicalEvent();
    event.type = 'CANCELACION';
    event.checkDate = new Date();
    event.simpleCheckDate = this.datepipe.transform(event.checkDate,'yyyy-MM-dd')!;
    event.simpleCheckHour = this.datepipe.transform(event.checkDate,'HH:mm:ss')!;
    event.params = {
      responsable: this.model.responsable,
      descripcion: this.model.descripcion
    };
    return event;
  }


  

  private validateForm() {
    if(!this.model.descripcion || !this.model.responsable) {
      this.showError();
      return false;
    }
    return true;
  }

  private showError() {
    Toast.show({
      text:'Debe diligenciar todos los campos del formulario',
      duration: "long",
      position: "bottom"
    });
  }




}
