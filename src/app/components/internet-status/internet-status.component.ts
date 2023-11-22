import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Toast } from '@capacitor/toast';



@Component({
  selector: 'app-internet-status',
  templateUrl: './internet-status.component.html',
  styleUrls: ['./internet-status.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]

})
export class InternetStatusComponent implements OnInit {

  networkStatus!: ConnectionStatus;
  beforeNetworkStatus: boolean = true;


  @ViewChild('toastContainer', { read: ViewContainerRef }) toastContainer: ViewContainerRef;

  constructor(private viewContainerRef: ViewContainerRef) { }

  async ngOnInit() {

    if (Network) {
      Network.addListener('networkStatusChange', (status) => {
        this.networkStatus = status;
        this.toastStatus();
      });
    }
  }

  toastStatus() {
    let toastText: string = '';
    if (this.networkStatus.connected && !this.beforeNetworkStatus) {
      this.beforeNetworkStatus = true;
      toastText = '¡Buena noticia! Hemos recuperado la conexión a Internet. ' +
        'Sincronizaremos todo tu trabajo ahora mismo.';
    } else if (!this.networkStatus.connected && this.beforeNetworkStatus) {
      this.beforeNetworkStatus = false;
      toastText = '¡Oops! Parece que hemos perdido la conexión a Internet. ' +
        'No te preocupes, la función offline te permitirá seguir trabajando.';
    }
    else {
      return;
    }
    this.showToast(toastText, "long", "bottom");
  }

  async showToast(toastText: string, toastDuration: 'short' | 'long', toastPosition: 'top' | 'center' | 'bottom') {
    await Toast.show({
      text: toastText,
      duration: toastDuration,
      position: toastPosition,
    });
  };
}
