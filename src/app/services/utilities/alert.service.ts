import { Injectable } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private alertController: AlertController,
    private platform: Platform
  ) {}

  async presentBasicAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async presentActionAlert(
    header: string,
    message: string,
    okAction: () => void
  ): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'OK',
          handler: okAction,
        },
      ],
    });
    await alert.present();
    alert.onDidDismiss().then(() => {
      okAction();
    });
  }

  async presentActionAlertCustom(
    header: string,
    message: string,
    okAction: () => void,
    cancelAction?: () => void,
    textOk?: string,
  ): Promise<void> {
    try {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: textOk || 'OK',
            handler: () => {
              try {
                okAction();
              } catch (error) {
                console.error('Error en okAction:', error);
              }
            },
          },
          {
            text: 'Cancelar',
            handler: () => {
              try {
                if (cancelAction) {
                  cancelAction();
                }
              } catch (error) {
                console.error('Error en cancelAction:', error);
              }
            },
          },
        ],
        backdropDismiss: false,
      });
      
      await alert.present();
      alert.onDidDismiss().then(() => {
      });
    } catch (error) {
      console.error('Error creando alert:', error);
      try {
        okAction();
      } catch (actionError) {
        console.error('Error en fallback action:', actionError);
      }
    }
  }
}
