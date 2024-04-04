import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';

@Component({
  selector: 'app-exit-menu',
  templateUrl: './exit-menu.page.html',
  styleUrls: ['./exit-menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class ExitMenuPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  goToRecovery() {
    this.navCtrl.navigateForward('recovery');
  }

  goToUCI() {
    this.navCtrl.navigateForward('uci');
  }

  goToDeath() {
    this.navCtrl.navigateForward('death');
  }

}
