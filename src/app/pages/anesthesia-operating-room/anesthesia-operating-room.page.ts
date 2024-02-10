import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';

@Component({
  selector: 'app-anesthesia-operating-room',
  templateUrl: './anesthesia-operating-room.page.html',
  styleUrls: ['./anesthesia-operating-room.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent]
})
export class AnesthesiaOperatingRoomPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
