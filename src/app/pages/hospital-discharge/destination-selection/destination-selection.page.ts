import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-destination-selection',
  templateUrl: './destination-selection.page.html',
  styleUrls: ['./destination-selection.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DestinationSelectionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
