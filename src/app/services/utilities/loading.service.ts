import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor(private loadingCtrl: LoadingController,) { }

  async showLoadingWithTimer(message: string, timer: number) {
    const loading = await this.loadingCtrl.create({
      message: message,
      duration: timer,
    });

    loading.present();
  }

  async showLoadingBasic(message: string) {
    const loading = await this.loadingCtrl.create({
      message: message
    });

    loading.present();
  }

  async dismiss(){
    this.loadingCtrl.dismiss();
  }
}
