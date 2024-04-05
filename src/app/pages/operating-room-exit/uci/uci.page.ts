import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, MenuController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { UCI } from 'src/app/models/uci.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { FromOperatingRoomTo } from 'src/app/models/from-operating-room-to.model';
import { HeaderComponent } from 'src/app/components/header/header.component';


@Component({
  selector: 'app-uci',
  templateUrl: './uci.page.html',
  styleUrls: ['./uci.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HeaderComponent]
})
export class UciPage implements OnInit {

  uci: UCI;

  model: any = {
    recieveName: null,
    description: null
  };

  datepipe = new DatePipe('en-US');


  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private inProgressRepository: InProgressMedicalAttentionService
    ) { 
      this.uci = new UCI();
    }

  ngOnInit() {}

  isValid() {
    let valid = true;
    for (let property in this.model) {
      if (this.model.hasOwnProperty(property)) {
        if(!(!!this.model[property])) {
          valid = false;
        }
      }
    }
    return valid;
  }

  checkDate() {
    this.uci.checkDate = new Date();
    this.uci.simpleCheckDate = this.datepipe.transform(this.uci.checkDate,'yyyy-MM-dd')!;
    this.uci.simpleCheckHour = this.datepipe.transform(this.uci.checkDate,'HH:mm:ss')!;
  }

  goToNextPage() {
    this.checkDate();
    const uci = this.mapViewToModel();
    
    const fromRoomTo = new FromOperatingRoomTo();
    fromRoomTo.status = StatusService.TERMINADO;
    fromRoomTo.to = "uci";
    fromRoomTo.checkDate = uci.checkDate;
    fromRoomTo.simpleCheckDate = this.datepipe.transform(fromRoomTo.checkDate,'yyyy-MM-dd')!;
    fromRoomTo.simpleCheckHour = this.datepipe.transform(fromRoomTo.checkDate,'HH:mm:ss')!;
    
    fromRoomTo.uci = uci;
    
    this.loadingService.showLoadingBasic("Cargando...");

    this.inProgressRepository.getInProgressMedicalAtenttion().then( sm => {
      sm.exitOperatingRoomList.fromOperatingRoomTo = fromRoomTo;
      sm.state = StatusService.TERMINADO;

      this.inProgressRepository.saveMedicalAttention(sm, 'sync')
        .then(result => {
          this.loadingService.dismiss();
          if(result) {
            this.navCtrl.navigateForward('/home');
          }
        }).catch(err => {
          this.loadingService.dismiss();
          console.error('No se pudo guardar el servicio médico',err);
          this.navCtrl.navigateForward('/home');
        });
    }).catch(e => {
      console.log('Error consultando la atencion médica',e);
      this.loadingService.dismiss();
      this.navCtrl.navigateForward('/home');
    });
  }

  private mapViewToModel(): UCI {
    this.uci.recieveName = this.model.recieveName;
    this.uci.description = this.model.description;
    this.uci.state = StatusService.TERMINADO;
    return this.uci;
  }

}
