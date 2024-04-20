import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';

@Component({
  selector: 'app-decease-destination',
  templateUrl: './decease-destination.page.html',
  styleUrls: ['./decease-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class DeceaseDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
