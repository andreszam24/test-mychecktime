import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-death',
  templateUrl: './death.page.html',
  styleUrls: ['./death.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DeathPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
