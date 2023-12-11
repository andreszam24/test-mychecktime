import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavParams } from '@ionic/angular';
import {HeaderComponent } from '../../components/header/header.component';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { SharedDataService } from 'src/app/services/utilities/shared-data.service';




@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.page.html',
  styleUrls: ['./patient-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class PatientSummaryPage implements OnInit{

  medicalAttention: MedicalAttention;

  constructor(
    private sharedDataService: SharedDataService
    ) { }

  ngOnInit() {
    this.getToPatientSummary()
    
  }

  getToPatientSummary(){
    this.medicalAttention = this.sharedDataService.getDatos();
  }
}
