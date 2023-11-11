import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController } from '@ionic/angular';
import { IonContent, IonLoading } from '@ionic/angular/standalone';

@Component({
  selector: 'app-app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss'],
  standalone: true,
  imports: [IonContent,IonLoading,IonicModule, CommonModule, FormsModule]

})
export class AppSpinnerComponent  implements OnInit {
  
  @Input() show: boolean = false;

  loading: HTMLIonLoadingElement;
  

  constructor(private loadingCtrl: LoadingController) { }

  ngOnInit() {}

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Cargando...',
    });
    return await this.loading.present();
}



}
