import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-uci-destination',
  templateUrl: './uci-destination.page.html',
  styleUrls: ['./uci-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class UCIDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
