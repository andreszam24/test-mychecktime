import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { USER_KEY } from 'src/app/services/auth.service';
import { ExitOperatingRoomList } from 'src/app/models/exit-operating-room-list.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-exit-menu',
  templateUrl: './exit-menu.page.html',
  styleUrls: ['./exit-menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent],
})
export class ExitMenuPage implements OnInit {
  dataUser: any;
  exitOperatingRoomList: ExitOperatingRoomList;
  modelExit: any = {
    confirmProcedure: false,
    instrumentsCount: false,
    verifyTagsPatient: false,
    problemsResolve: false,
    recoveryReview: null,
    bloodCount: null,
    bloodCountUnits: 'ml',
  };
  datepipe = new DatePipe('en-US');
  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService
  ) {
    this.exitOperatingRoomList = new ExitOperatingRoomList();
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {}

  mapViewToModelExit() {
    this.exitOperatingRoomList.checkDate = new Date();
    this.exitOperatingRoomList.simpleCheckDate = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate, 
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleCheckHour = this.datepipe.transform(
      this.exitOperatingRoomList.checkDate,
      'HH:mm:ss'
    )!;
    this.exitOperatingRoomList.confirmProcedure = this.modelExit.confirmProcedure;
    this.exitOperatingRoomList.instrumentsCount = this.modelExit.instrumentsCount;
    this.exitOperatingRoomList.verifyTagsPatient = this.modelExit.verifyTagsPatient;
    this.exitOperatingRoomList.problemsResolve = this.modelExit.problemsResolve;
    this.exitOperatingRoomList.recoveryReview = this.modelExit.recoveryReview;
    this.exitOperatingRoomList.bloodCount = this.modelExit.bloodCount;
    this.exitOperatingRoomList.bloodCountUnits = this.modelExit.bloodCountUnits;
    this.exitOperatingRoomList.endProcedureDate = new Date();
    this.exitOperatingRoomList.simpleEndProcedureDate = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'yyyy-MM-dd'
    )!;
    this.exitOperatingRoomList.simpleEndProcedureHour = this.datepipe.transform(
      this.exitOperatingRoomList.endProcedureDate,
      'HH:mm:ss'
    )!;

    return this.exitOperatingRoomList;
  }

  async goToNextPageExit() {
    const exitOperatingRoomList = this.mapViewToModelExit();
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.exitOperatingRoomList = exitOperatingRoomList;
        sm.state = StatusService.EXIT_OPERATING_ROOM_LIST;

        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            if (result) {
              this.navCtrl.navigateForward('/recovery');
            }
          })
          .catch(() => {
            this.navCtrl.navigateForward('/home');
            console.error('No se pudo guardar el servicio médico');
          });
      })
      .catch(() => {
        this.navCtrl.navigateForward('/home');
        console.log('Error consultando la atencion médica');
      });
  }

  getRoleUser() {
    return JSON.parse(this.dataUser)?.roles[0]?.id === 4;
  }
  goToRecovery() {
    this.navCtrl.navigateForward('recovery');
  }

  goToUCI() {
    this.navCtrl.navigateForward('uci');
  }

  goToDeath() {
    this.navCtrl.navigateForward('death');
  }
}
