import { Component, OnInit, Input} from '@angular/core';
import { ToastController} from '@ionic/angular';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone:true,
  imports:[]
})
export class ToastComponent  implements OnInit {
  @Input() toastText: string;
  @Input() toastDuration: number;
  @Input() color: string;


  constructor(
    public toastController: ToastController,
  ) { }

  ngOnInit() {
    this.showHelloToast();
  }

  async showHelloToast() {
    const toast = await this.toastController.create({
      message: this.toastText,
      duration: this.toastDuration,
      position:'bottom',
      color:this.color,
      cssClass:'custom-toast'
    });
    toast.present();
  };

}
