import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-uci-destination',
  templateUrl: './uci-destination.page.html',
  styleUrls: ['./uci-destination.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class UCIDestinationPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
