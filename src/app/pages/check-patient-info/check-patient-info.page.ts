import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-check-patient-info',
  templateUrl: './check-patient-info.page.html',
  styleUrls: ['./check-patient-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CheckPatientInfoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
