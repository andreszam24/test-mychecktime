import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons,IonMenuButton,IonIcon,IonMenu, IonContent, IonList,IonItem,IonLabel,IonMenuToggle,IonImg, NavController} from '@ionic/angular/standalone';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Patient } from 'src/app/models/patient.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[RouterLink, RouterLinkActive,IonHeader,IonToolbar, IonTitle,IonButtons,IonMenuButton,IonIcon, IonMenu, IonContent, IonList, IonItem,IonLabel,IonMenuToggle,IonImg]
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
  ) { }

  ngOnInit() {
    this.headerPatient();
  }

  handleClick(wildcard:string) {
    if (wildcard == 'paciente'){
      console.log('Se hizo clic en el componente:',this.patient);
      this.sharedDataService.setDatos(this.medicalAttention);
      this.navCtrl.navigateForward('/patient-summary');
    }
  }


  headerPatient(){
    console.log('Valor de iconPatient:', this.iconPatient);
    this.wildcard = this.titleName;
    if(this.titleName=='paciente'){
      this.iconPatient = true;
      console.log('Valor de iconPatient if:', this.iconPatient);
      this.inProgressMedicalAttentio.getInProgressMedicalAtenttion().then(sm => {
        if(!!sm && !!sm.patient) {
          this.medicalAttention = sm;
          console.log(this.medicalAttention);
          this.patient = sm.patient;
          this.titleName = this.patient.name + ' ' + this.patient.lastname;
        }
      }).catch(e => {
        console.log('No pudo cargarse el servicio médico');
      });
    } else{
      this.iconPatient= false;
    }
    //console.log('Valor de iconPatient finish:', this.iconPatient);
  }

}
