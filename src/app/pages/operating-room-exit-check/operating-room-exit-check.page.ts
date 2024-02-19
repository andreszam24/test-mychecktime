import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-operating-room-exit-check',
  templateUrl: './operating-room-exit-check.page.html',
  styleUrls: ['./operating-room-exit-check.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class OperatingRoomExitCheckPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
