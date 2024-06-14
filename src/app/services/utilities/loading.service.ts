import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading: HTMLIonLoadingElement | null;

  constructor(private loadingCtrl: LoadingController,) {}

  async showLoadingWithTimer(message: string, timer: number) {
    if (this.loading) {
      await this.dismiss();
    }

    this.loading = await this.loadingCtrl.create({
      message: message,
      duration: timer,
    });

    this.loading.present();
  }

  async showLoadingBasic(message: string) {
    if (this.loading) {
      await this.dismiss();
    }

    this.loading = await this.loadingCtrl.create({
      message: message
    });

    this.loading.present();

  }

async dismiss() {
  if (this.loading) {
    await this.loading.dismiss();
    this.loading = null;
  }
}
}
