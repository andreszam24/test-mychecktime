import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonRow, IonCol,IonFab,IonFabButton,IonIcon, NavController} from '@ionic/angular/standalone';

@Component({
  selector: 'app-events-panel',
  templateUrl: './events-panel.component.html',
  styleUrls: ['./events-panel.component.scss'],
  standalone:true,
  imports: [IonRow,IonCol,IonFab,IonIcon,IonFabButton, CommonModule]
})
export class EventsPanelComponent  implements OnInit {

  @Input() showCancelEvent: boolean = false;



  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  openComplicationsPage() {
    this.navCtrl.navigateForward('/complications');
  }

  openTransfusionPage() {
    this.navCtrl.navigateForward('/transfusion');
  }

  openAdverseEventPage() {
    this.navCtrl.navigateForward('/adverse-event');
  }

  openCancellationPage() {
    this.navCtrl.navigateForward('/cancellation');
  }

}
