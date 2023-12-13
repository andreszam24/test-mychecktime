import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons,IonMenuButton,IonIcon,IonMenu, IonContent, IonList,IonItem,IonLabel,IonMenuToggle,IonImg} from '@ionic/angular/standalone';
import { Patient } from 'src/app/models/patient.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[RouterLink, RouterLinkActive,IonHeader,IonToolbar, IonTitle,IonButtons,IonMenuButton,IonIcon, IonMenu, IonContent, IonList, IonItem,IonLabel,IonMenuToggle,IonImg]
})
export class HeaderComponent  implements OnInit {
  @Input() titleName: string ;
  patient: Patient;
  public iconpatient:Boolean;
 

  constructor(
    private inProgressMedicalAttentio: InProgressMedicalAttentionService,
  ) { }

  ngOnInit() {
    this.headerPatient();
  }


  headerPatient(){
    if(this.titleName=='paciente'){
      this.inProgressMedicalAttentio.getInProgressMedicalAtenttion().then(sm => {
        if(!!sm && !!sm.patient) {
          this.patient = sm.patient;
          this.titleName = this.patient.name + ' ' + this.patient.lastname;
          this.iconpatient = true;
        }
      }).catch(e => {
        console.log('No pudo cargarse el servicio médico');
      });
    } else{
      this.iconpatient = false;
    }
    console.log(this.iconpatient)
  }

}
