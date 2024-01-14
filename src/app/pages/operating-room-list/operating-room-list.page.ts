import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-operating-room-list',
  templateUrl: './operating-room-list.page.html',
  styleUrls: ['./operating-room-list.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class OperatingRoomListPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
