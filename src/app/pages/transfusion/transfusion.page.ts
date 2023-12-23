import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { IonicModule, NavController } from '@ionic/angular';
import { MedicalEvent } from 'src/app/models/medical-event.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { AppSpinnerComponent } from 'src/app/components/app-spinner/app-spinner.component';

@Component({
  selector: 'app-transfusion',
  templateUrl: './transfusion.page.html',
  styleUrls: ['./transfusion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, AppSpinnerComponent]
})
export class TransfusionPage implements OnInit {

  redBloodCells = 0;
  platelets = 0;
  plasma = 0;
  cryoprecipitate = 0;
  descripcion = null;
  paramsPrevious:any;
  

  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private inProgressRepository: InProgressMedicalAttentionService
  ) { 
    this.getPreviousTransfusionCount()
  }

  ngOnInit() {
  }

  goToBackPage(){
    this.navCtrl.back()
  }

  getPreviousTransfusionCount(){
    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
     
      if(sm.events !== undefined && sm.events.length > 0){
        const eventosTransfusion = sm.events.filter( evento => evento.type === 'TRANSFUSION');
        
        this.paramsPrevious = eventosTransfusion[eventosTransfusion.length - 1].params;

        this.redBloodCells = this.paramsPrevious['globulosRojos'];
        this.platelets = this.paramsPrevious['plaquetas']!;
        this.plasma = this.paramsPrevious['plasma']!;
        this.cryoprecipitate = this.paramsPrevious['crioprecipitado']!;
      }
    }).catch(e => console.log('Error consultando la atencion médica'));

  }

  toContinue() {
    if(!this.validateForm()) {
      return;
    }

    const event = this.mapViewToModel();
    
    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      const events = sm.events || [];
      events.push(event);
      sm.events = events;

      this.inProgressRepository.saveMedicalAttention(sm, 'nosync')
        .then(result => {
            if(result) {
              this.navCtrl.pop();
            }
        }).catch(err => console.error('No se pudo guardar el servicio médico'));
    }).catch(e => console.log('Error consultando la atencion médica'));
  }

  private mapViewToModel(): MedicalEvent {
    const event = new MedicalEvent();
    event.type = 'TRANSFUSION';
    event.checkDate = new Date();
    event.simpleCheckDate = this.datepipe.transform(event.checkDate,'yyyy-MM-dd')!;
    event.simpleCheckHour = this.datepipe.transform(event.checkDate,'HH:mm:ss')!;
    event.params = {
      redBloodCells: this.redBloodCells,
      platelets: this.platelets,
      plasma: this.plasma,
      cryoprecipitate: this.cryoprecipitate,
      descripcion: this.descripcion
    };
    return event;
  }

  private validateForm() {
    if(this.redBloodCells < 0 || this.platelets < 0 || this.plasma < 0 || this.cryoprecipitate < 0) {
      this.showError();
      return false;
    }

    if(this.paramsPrevious !== null) { 
      if((this.redBloodCells + this.platelets + this.plasma + this.cryoprecipitate) === 0 &&
        (this.paramsPrevious['globulosRojos'] + this.paramsPrevious['plaquetas'] + this.paramsPrevious['plasma'] + this.paramsPrevious['crioprecipitado']) === 0) {
          this.showErrorFill();
          return false;
      }
      if(this.redBloodCells === this.paramsPrevious['globulosRojos'] && this.platelets === this.paramsPrevious['plaquetas'] &&
         this.plasma === this.paramsPrevious['plasma'] && this.cryoprecipitate === this.paramsPrevious['crioprecipitado']) {
          return false;
        }
    }

    if((this.redBloodCells + this.platelets + this.plasma + this.cryoprecipitate) === 0 ){
      this.showErrorFill();
      return false;
    }
    return true;
  }

  private showError() {
    Toast.show({
      text:'Se encontraron valores incorrectos',
      duration: "long",
      position: "bottom"
    });
  }

  private showErrorFill(){
    Toast.show({
      text:'Debe agregar al menos uno de los valores',
      duration: "long",
      position: "bottom"
    });
  }
}


