import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { USER_KEY } from 'src/app/services/auth.service';

@Component({
  selector: 'app-pre-scan-qr',
  templateUrl: './pre-scan-qr.component.html',
  styleUrls: ['./pre-scan-qr.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PreScanQrComponent implements OnInit {
  @Input() text: string;
  dataUser: any;

  constructor(private modalCtrl: ModalController) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {}

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.id === 870 || userData?.id === 866;
  }

  scan() {
    return this.modalCtrl.dismiss('scan');
  }

  showDemoOptions() {
    return this.modalCtrl.dismiss('demo');
  }
}
