import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons,IonMenuButton,IonIcon,IonMenu, IonContent, IonList,IonItem,IonLabel,IonMenuToggle,IonImg, NavController, IonButton} from '@ionic/angular/standalone';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from 'src/app/models/patient.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[RouterLink, RouterLinkActive,IonHeader,IonToolbar, IonTitle,IonButtons,IonButton,IonMenuButton,IonIcon, IonMenu, IonContent, IonList, IonItem,IonLabel,IonMenuToggle,IonImg, CommonModule]
})
export class HeaderComponent  implements OnInit {
  @Input() titleName: string ;
  wildcard:string;
  patient: Patient;
  iconPatient:Boolean = false;
  medicalAttention:MedicalAttention;

 

  constructor(
    private inProgressMedicalAttentio: InProgressMedicalAttentionService,
    private sharedDataService: SharedDataService,
    private navCtrl: NavController,
    private menu :MenuController
  ) { }

  ngOnInit() {
    this.headerPatient();
  }

  handleClick(wildcard:string) {
    if (wildcard == 'paciente'){
      this.sharedDataService.setDatos(this.medicalAttention);
      this.navCtrl.navigateForward('/patient-summary');
    }
  }


  headerPatient(){
    this.wildcard = this.titleName;
    if(this.titleName=='paciente'){
      this.iconPatient = true;
      this.inProgressMedicalAttentio.getInProgressMedicalAtenttion().then(sm => {
        if(!!sm && !!sm.patient) {
          this.medicalAttention = sm;
          this.patient = sm.patient;
          this.titleName = this.patient.name + ' ' + this.patient.lastname;
        }
      }).catch(e => {
        console.log('No pudo cargarse el servicio médico');
      });
    } else{
      this.iconPatient= false;
    }
  }

}
