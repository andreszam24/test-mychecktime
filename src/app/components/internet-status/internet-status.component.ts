import { Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Toast } from '@capacitor/toast';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { WorkingAreaService } from 'src/app/services/working-area.service';
import { AuthService } from 'src/app/services/auth.service';
import { InternetServiceService } from 'src/app/services/internet-service.service';



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

  constructor(private internetService: InternetServiceService) { }

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
        this.internetService.updateInternetStatus(true);
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
