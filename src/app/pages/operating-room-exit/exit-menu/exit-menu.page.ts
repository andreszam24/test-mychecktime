import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { USER_KEY } from 'src/app/services/auth.service';

@Component({
  selector: 'app-exit-menu',
  templateUrl: './exit-menu.page.html',
  styleUrls: ['./exit-menu.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class ExitMenuPage implements OnInit {

  dataUser: any;
  
  constructor(private navCtrl: NavController) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
  }

  getRoleUser() {
    return JSON.parse(this.dataUser)?.roles[0]?.id === 4;
  };
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
