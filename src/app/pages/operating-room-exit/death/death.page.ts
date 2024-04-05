import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { FromOperatingRoomTo } from 'src/app/models/from-operating-room-to.model';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';


@Component({
  selector: 'app-death',
  templateUrl: './death.page.html',
  styleUrls: ['./death.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, ButtonPanelComponent]
})
export class DeathPage implements OnInit {

  fromRoomTo: FromOperatingRoomTo;
  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private inProgressRepository: InProgressMedicalAttentionService
  ) { 
    this.fromRoomTo = new FromOperatingRoomTo();
  }

  ngOnInit() {
  }

  registerDeathTime() {
    this.fromRoomTo.checkDate = new Date();
    this.fromRoomTo.simpleCheckDate = this.datepipe.transform(this.fromRoomTo.checkDate,'yyyy-MM-dd')!;
    this.fromRoomTo.simpleCheckHour = this.datepipe.transform(this.fromRoomTo.checkDate,'HH:mm:ss')!;
  }

  isValid() {
    return !!this.fromRoomTo.checkDate;
  }

  goToNextPage() {
    this.loadingService.showLoadingBasic("Cargando...");

    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      this.fromRoomTo.decease = new Date();
      this.fromRoomTo.simpleDeceaseDate = this.datepipe.transform(this.fromRoomTo.decease,'yyyy-MM-dd')!;
      this.fromRoomTo.simpleDeceaseHour = this.datepipe.transform(this.fromRoomTo.decease,'HH:mm:ss')!;

      this.fromRoomTo.to = "SALA_DE_PAZ";
      this.fromRoomTo.status = StatusService.TERMINADO;

      sm.exitOperatingRoomList.fromOperatingRoomTo = this.fromRoomTo;
      sm.state = StatusService.TERMINADO;

      this.inProgressRepository.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              this.navCtrl.navigateForward('/home');
            }
            this.loadingService.dismiss();
          }).catch(() => {
            this.loadingService.dismiss();
            console.error('No se pudo guardar el servicio médico');
            this.navCtrl.navigateForward('/home');
          });
    }).catch(() =>{ 
      this.loadingService.dismiss();
      console.log('Error consultando la atencion médica');
      this.navCtrl.navigateForward('/home');
    });
  }

}
