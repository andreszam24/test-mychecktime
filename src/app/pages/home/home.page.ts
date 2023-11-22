import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import {InternetStatusComponent} from '../../components/internet-status/internet-status.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton,IonCard,IonCardContent,IonList,IonItem,IonItemSliding, IonItemOption, IonItemOptions,IonImg,IonicModule, FormsModule, InternetStatusComponent, CommonModule],
})
export class HomePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  public goToPatientIntake(){
    this.router.navigateByUrl('/patient-intake');
  }
}
