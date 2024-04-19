import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading: HTMLIonLoadingElement;

  constructor(private loadingCtrl: LoadingController,) { this.loadingCtrl = new LoadingController()}

  async showLoadingWithTimer(message: string, timer: number) {
    this.loading = await this.loadingCtrl.create({
      message: message,
      duration: timer,
    });

    this.loading.present();
  }

  async showLoadingBasic(message: string) {
    this.loading = await this.loadingCtrl.create({
      message: message
    });

    this.loading.present();
  }

  async dismiss(){
    console.log('ocuktando')
    if (this.loading) {
      console.log('cdismmis')
        await this.loading.dismiss();
    }
  }
}
