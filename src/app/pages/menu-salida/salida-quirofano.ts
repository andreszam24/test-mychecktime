import { Component } from '@angular/core';
import { NavController, MenuController } from 'ionic-angular';

import { RecuperacionPage } from './../recuperacion/recuperacion';
import { UCIPage } from './../uci/uci';
import { FallecimientoPage } from './../fallecimiento/fallecimiento';

@Component({
  selector: 'salida-quirofano-page',
  templateUrl: 'salida-quirofano.html'
})
export class SalidaQuirofanoPage {

  constructor(public navCtrl: NavController, public menu: MenuController) {
    this.menu.enable(true, 'menu-anestesia');
  }
  
  goToRecuperacion() {
    this.navCtrl.push(RecuperacionPage);
  }

  goToUCI() {
    this.navCtrl.push(UCIPage);
  }

  goToFallecimiento() {
    this.navCtrl.push(FallecimientoPage);
  }
}
