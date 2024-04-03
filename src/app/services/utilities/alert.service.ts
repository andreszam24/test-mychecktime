import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private alertController: AlertController, private platform: Platform) {}

  async presentBasicAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentActionAlert(header: string, message: string, okAction: () => void): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [{
        text: 'OK',
        handler: okAction
      }]
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      okAction();
    });
  }
}
