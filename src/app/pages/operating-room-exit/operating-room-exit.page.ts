import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-operating-room-exit',
  templateUrl: './operating-room-exit.page.html',
  styleUrls: ['./operating-room-exit.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OperatingRoomExitPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
