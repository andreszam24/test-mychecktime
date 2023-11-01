import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import {InternetStatusComponent} from '../../components/internet-status/internet-status.component';



@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InternetStatusComponent]
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  } 

}
