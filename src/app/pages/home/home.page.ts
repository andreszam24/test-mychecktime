import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {InternetStatusComponent} from '../../components/internet-status/internet-status.component';
import {HeaderComponent} from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { switchMap } from 'rxjs/operators';
import { of, catchError } from 'rxjs';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';




@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg,IonicModule, FormsModule, InternetStatusComponent, CommonModule, HeaderComponent],
})
export class HomePage implements OnInit {

  patientsLis: Patient[] = [];
  clinicName:string;
  clinicId:number;
  anesthesiologistId:number;
  attentionsInProgress: MedicalAttention[] = [];

  constructor(private router: Router,private authService: AuthService, private httpInProgressMedicalAttention: InProgressMedicalAttentionService,
    ) { }

  ngOnInit() {
    this.extractUserData();
  }

  private extractUserData(){
    return this.authService.user.subscribe(
      userData => {
        console.log('userData: ',userData)
        this.clinicName = userData.account.clinics[0].name;
        this.clinicId = userData.account.clinics[0].id;
        this.anesthesiologistId = userData.account.id
        this.getPendingMedicalAtenttions(this.clinicId,this.anesthesiologistId);
      }
    )
  }


  getPendingMedicalAtenttions(clinicId: number, anesthesiologistId: number) {
    this.httpInProgressMedicalAttention.searchPendingServices(clinicId, anesthesiologistId)
      .pipe(
        catchError((error) => {
          console.error('Ups! Algo salió mal al consultar atenciones médicas pendientes: ', error);
          return of([]);
        }),
        switchMap((result) => {
          if (result) {
            this.attentionsInProgress = result;
          } else {
            console.warn('La respuesta es nula o indefinida.');
          }
            return of(this.attentionsInProgress); 
        })
      ).subscribe({
        next: (data) => {
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        }
      });
  }

  getRoomName(medicalRecord: MedicalAttention) {
    let hall = 'Sin ingresar a sala';

    if (medicalRecord.operatingRoom !== undefined) {
      if (medicalRecord.operatingRoom.name !== null && medicalRecord.operatingRoom.name !== undefined) {
        hall = medicalRecord.operatingRoom.name;
      }
    }
    return hall;
  }

  getAttentionStage(sm: MedicalAttention): string {
  const medicalAttentionStage = sm.state;

  const colorMap = {
    [StatusService.INICIO]: 'var(--ion-color-app-purple)',
    [StatusService.FROM_OPERATING_ROOM_TO]: 'var(--ion-color-app-yellow)',
    [StatusService.TERMINADO]: 'transparent',
    [StatusService.CANCELADO]: 'transparent',
  };

  if (StatusService.PATIENTS_IN_PREANESTHESIA.includes(medicalAttentionStage)) {
    return 'var(--ion-color-app-orange)';
  } else if (StatusService.PATIENT_IN_OPERETING_ROOM.includes(medicalAttentionStage)) {
    return 'var(--ion-color-app-red)';
  } else if (StatusService.PATIENTS_WITH_DISCHARGE_ORDER.includes(medicalAttentionStage)) {
    return 'var(--ion-color-app-blue)';
  }

  return colorMap[medicalAttentionStage] || 'transparent';
}

  public goToPatientIntake(){
    this.router.navigateByUrl('/patient-intake');
  }
}
