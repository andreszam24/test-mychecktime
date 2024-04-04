import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-exit-menu',
  templateUrl: './exit-menu.page.html',
  styleUrls: ['./exit-menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ExitMenuPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
