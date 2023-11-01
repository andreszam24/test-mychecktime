import { Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Network, ConnectionStatus} from '@capacitor/network';
import {ToastComponent} from '../../components/toast/toast.component';


@Component({
  selector: 'app-internet-status',
  templateUrl: './internet-status.component.html',
  styleUrls: ['./internet-status.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,ToastComponent]

})
export class InternetStatusComponent implements OnInit {

  networkStatus!:ConnectionStatus
  toastText: string;
  toastDuration: number = 5000;
  color: string;
  @ViewChild('toastContainer', { read: ViewContainerRef }) toastContainer: ViewContainerRef;
  
  constructor(private viewContainerRef: ViewContainerRef) { }

  ngOnInit() {

    if(Network){ 
      Network.getStatus().then((status)=>{
        this.networkStatus=status
        this.toastStatus() 
      })
    }

    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      this.toastStatus()
    });
  }

  toastStatus(){
    if (this.networkStatus.connected) {
      this.toastText = '¡Buena noticia! Hemos recuperado la conexión a Internet. ' +
      'Sincronizaremos todo tu trabajo ahora mismo.';
      this.color = "light";
    } else {
      this.toastText = '¡Oops! Parece que hemos perdido la conexión a Internet. ' +
      'No te preocupes, la función offline te permitirá seguir trabajando.';
      this.color = "dark";
    }    
    this.showHelloToast();
  }

  showHelloToast() {
    this.toastContainer.clear();
    const factory = this.viewContainerRef.createComponent(ToastComponent);  
    factory.instance.toastText = this.toastText;
    factory.instance.toastDuration = this.toastDuration;
    factory.instance.color = this.color;

  }

}
