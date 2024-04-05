import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';

@Component({
  selector: 'app-start-proces',
  templateUrl: './start-proces.page.html',
  styleUrls: ['./start-proces.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, EventsPanelComponent]
})
export class StartProcesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
