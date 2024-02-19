import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-decease-destination',
  templateUrl: './decease-destination.page.html',
  styleUrls: ['./decease-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeceaseDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
