import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-adverse-event',
  templateUrl: './adverse-event.page.html',
  styleUrls: ['./adverse-event.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdverseEventPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
