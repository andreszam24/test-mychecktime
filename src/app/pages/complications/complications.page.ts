import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-complications',
  templateUrl: './complications.page.html',
  styleUrls: ['./complications.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ComplicationsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
