import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '@capacitor/toast';
import { IonicModule, NavController } from '@ionic/angular';
import { MedicalEvent } from 'src/app/models/medical-event.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';

@Component({
  selector: 'app-adverse-event',
  templateUrl: './adverse-event.page.html',
  styleUrls: ['./adverse-event.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,ButtonPanelComponent]
})
export class AdverseEventPage implements OnInit {

  model = {
    descripcion: null
  };
  
  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private inProgressRepository: InProgressMedicalAttentionService
  ) { }

  ngOnInit() {
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
    event.type = 'EVENTO ADVERSO';
    event.checkDate = new Date();
    event.simpleCheckDate = this.datepipe.transform(event.checkDate,'yyyy-MM-dd')!;
    event.simpleCheckHour = this.datepipe.transform(event.checkDate,'HH:mm:ss')!;
    event.params = {
      descripcion: this.model.descripcion
    };
    return event;
  }

  private validateForm() {
    if(!this.model.descripcion) {
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
