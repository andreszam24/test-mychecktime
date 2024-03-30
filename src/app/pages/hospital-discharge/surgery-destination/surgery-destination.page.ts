import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-surgery-destination',
  templateUrl: './surgery-destination.page.html',
  styleUrls: ['./surgery-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SurgeryDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
