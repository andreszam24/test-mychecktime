import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-hospitalization-destination',
  templateUrl: './hospitalization-destination.page.html',
  styleUrls: ['./hospitalization-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HospitalizationDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
