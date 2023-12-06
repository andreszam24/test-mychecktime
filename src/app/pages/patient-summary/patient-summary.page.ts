import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {HeaderComponent} from '../../components/header/header.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.page.html',
  styleUrls: ['./patient-summary.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class PatientSummaryPage implements OnInit {
  id:any

  constructor(private activatedRoute:ActivatedRoute) { }

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get("id");
    console.log("id", this.id);
  }

}
