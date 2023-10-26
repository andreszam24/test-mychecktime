import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Network, ConnectionStatus} from '@capacitor/network';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {

  networkStatus!:ConnectionStatus

  constructor() { }

  ngOnInit() {

    if(Network){
      Network.getStatus().then((status)=>{
        this.networkStatus=status
      })
    }

    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
    });

  } 
}
