import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import {HeaderComponent } from '../../components/header/header.component';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';




@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.page.html',
  styleUrls: ['./patient-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent,ButtonPanelComponent ]
})
export class PatientSummaryPage implements OnInit{

  medicalAttention: MedicalAttention;

  constructor(
    private sharedDataService: SharedDataService,
    private navCtrl: NavController,

    ) { }

  ngOnInit() {
    this.getToPatientSummary()
    
  }

  getToPatientSummary(){
    this.medicalAttention = this.sharedDataService.getDatos();
  }

  goToBackPage(){
    this.navCtrl.back();
  }

}
