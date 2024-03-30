import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-start-proces',
  templateUrl: './start-proces.page.html',
  styleUrls: ['./start-proces.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class StartProcesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
