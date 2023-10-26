import { Component, OnInit, Input } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  standalone:true,
  imports:[]
})
export class ToastComponent  implements OnInit {

  @Input() toastText: string = '';
  @Input() toastDuration: 'short' | 'long' = 'short';

  constructor() { }

  ngOnInit() {
    this.showHelloToast();
  }

  async showHelloToast() {
    await Toast.show({
      text: this.toastText,
      duration: this.toastDuration,
      position:'top',
    });
  };

}
