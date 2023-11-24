import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {InternetStatusComponent} from '../../components/internet-status/internet-status.component';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { switchMap, finalize } from 'rxjs/operators';
import { of, catchError } from 'rxjs';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';




@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg,IonicModule, FormsModule, InternetStatusComponent, CommonModule],
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
    console.log(this.attentionsInProgress);
  }

  private extractUserData(){
    return this.authService.getUser().subscribe(
      userData => {
        this.clinicName = userData.account.clinics[0].name;
        this.clinicId = userData.account.clinics[0].id;
        this.anesthesiologistId = userData.account.id
        this.getPendingMedicalAtenttions(this.clinicId,this.anesthesiologistId);
      }
    )
  }


  getPendingMedicalAtenttions(clinicId: number, anesthesiologistId: number) {
    console.log('getPendingMedicalAtenttions se está ejecutando.');
    this.httpInProgressMedicalAttention.searchPendingServices(clinicId, anesthesiologistId)
      .pipe(
        catchError((error) => {
          console.error('Ups! Algo salió mal al consultar atenciones médicas pendientes: ', error);
          return of([]);
        }),
        switchMap((result) => {
          if (result) {
            this.attentionsInProgress = result;
            console.log('asignacion en switchMap:', this.attentionsInProgress);
          } else {
            console.warn('La respuesta es nula o indefinida.');
          }
            return of(this.attentionsInProgress); 
        })
      ).subscribe({
        next: (data) => {
          console.log('Datos recibidos en la suscripción:', data);
        },
        error: (error) => {
          console.error('Error al obtener datos:', error);
        }
      });
  }

  obtenerNombreDeSala(registroMedico: MedicalAttention) {
    let sala = 'sin ingresar a sala';

    if (registroMedico.operatingRoom !== undefined) {
      if (registroMedico.operatingRoom.name !== null && registroMedico.operatingRoom.name !== undefined) {
        sala = registroMedico.operatingRoom.name;
      }
    }
    return sala;
  }

  public goToPatientIntake(){
    this.router.navigateByUrl('/patient-intake');
  }
}
