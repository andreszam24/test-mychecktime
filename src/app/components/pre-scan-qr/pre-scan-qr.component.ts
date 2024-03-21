import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pre-scan-qr',
  templateUrl: './pre-scan-qr.component.html',
  styleUrls: ['./pre-scan-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PreScanQrComponent  implements OnInit {

  @Input() text: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  scan() {
    return this.modalCtrl.dismiss('scan');
  }

}
