import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home-destination',
  templateUrl: './home-destination.page.html',
  styleUrls: ['./home-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomeDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
