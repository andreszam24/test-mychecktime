import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {InternetStatusComponent} from '../../components/internet-status/internet-status.component';
import { AuthService } from '../../services/auth.service';
import { Patient } from '../../models/patient.model';
import { PatientService } from 'src/app/services/patient.service';
import { of, catchError } from 'rxjs';




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

  constructor(private router: Router,private authService: AuthService, private patientService:PatientService ) { }

  ngOnInit() {
    this.extractUserData();
    this.getAllPatients();
  }

  private extractUserData(){
    return this.authService.getUser().subscribe(
      userData => {
        this.clinicName = userData.account.clinics[0].name;
      }
    )
  }

  private getAllPatients(){
    this.patientService.getAllPatients().pipe(
      catchError((error) => {
        console.log('Error', error);
        return of(null);
      })
    ).subscribe((patients)=>{
      this.patientsLis = JSON.parse(JSON.stringify(patients));
      console.log('patientsLis', this.patientsLis);
    });
  }

  public goToPatientIntake(){
    this.router.navigateByUrl('/patient-intake');
  }
}
