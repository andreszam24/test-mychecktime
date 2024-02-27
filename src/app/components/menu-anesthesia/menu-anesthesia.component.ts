import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';

@Component({
  selector: 'app-menu-anesthesia',
  templateUrl: './menu-anesthesia.component.html',
  styleUrls: ['./menu-anesthesia.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MenuAnesthesiaComponent  implements OnInit {

  anesthesiaTypes: Array<string>;

  constructor(
    private inProgressRepository: InProgressMedicalAttentionService,
  ) { }

  ngOnInit() {}

  addAnesthesiaType(anestesia: string) {
    console.log('entro addAnesthesiaType')
    this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
      console.log(!!sm && !!sm.operatingRoomList)
      if(!!sm && !!sm.operatingRoomList) {
        const anesthesiaTypes: Array<string> = sm.operatingRoomList.anesthesiaTypes || [];
        if(!(!!anesthesiaTypes.find(it => it === anestesia))) {
          anesthesiaTypes.push(anestesia);
          
          sm.operatingRoomList.anesthesiaTypes = anesthesiaTypes;
          this.anesthesiaTypes = anesthesiaTypes;
        } else {
          const excludeAnesthesiaList = anesthesiaTypes.filter(it => it !== anestesia);

          sm.operatingRoomList.anesthesiaTypes = excludeAnesthesiaList;
          this.anesthesiaTypes = excludeAnesthesiaList;
        }
        this.inProgressRepository.saveMedicalAttention(sm,'nosync');
      }
    }).catch(e => console.error('Error consultando el servicio médico'));
  }

  menuOpened() {
    console.log('entro a menuOpened')
    this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
      this.anesthesiaTypes = sm.operatingRoomList.anesthesiaTypes || [];
    }).catch(e => console.error('Error consultando el servicio médico'));
  }

  anesthesiaSelected(anestesia: string) {
    console.log('this.anesthesiaTypes: ',this.anesthesiaTypes,'=',!!this.anesthesiaTypes && this.anesthesiaTypes.some(x => x === anestesia))
    return !!this.anesthesiaTypes && this.anesthesiaTypes.some(x => x === anestesia);
  }

}
