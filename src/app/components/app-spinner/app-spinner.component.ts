import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]

})
export class AppSpinnerComponent  implements OnInit {
  
  @Input() show: boolean = false;

  constructor() { }

  ngOnInit() {}

}
