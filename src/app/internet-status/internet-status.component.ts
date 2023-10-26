import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Network, ConnectionStatus} from '@capacitor/network';

@Component({
  selector: 'app-internet-status',
  templateUrl: './internet-status.component.html',
  styleUrls: ['./internet-status.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, InternetStatusComponent]

})
export class InternetStatusComponent  implements OnInit {

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
