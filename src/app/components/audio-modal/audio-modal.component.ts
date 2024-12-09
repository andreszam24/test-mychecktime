import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonButton, IonicModule, ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-audio-modal',
  templateUrl: './audio-modal.component.html',
  styleUrls: ['./audio-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AudioModalComponent implements OnInit {
  @Input() audioSrc: string;
  @Input() title: string = '';
  @Input() contentText: string = '';
  @ViewChild('closeButton', { static: true }) closeButton: IonButton;

  audio: HTMLAudioElement;
  isAudioEnded: boolean = false;

  constructor(
    private modalController: ModalController,
    private navController: NavController
  ) {}

  ngOnInit() {
    this.audio = new Audio(this.audioSrc);
    this.audio.volume = 1;
    this.playAudio();
    this.audio.addEventListener('ended', () => {
      this.isAudioEnded = true;
      this.closeButton.disabled = false;
    });

    this.closeButton.disabled = true;
  }

  playAudio() {
    this.audio.play();
  }

  pauseAudio() {
    this.audio.pause();
  }

  restartAudio() {
    this.audio.currentTime = 0;
    this.audio.play();
  }

  cancelAudio() {
    this.pauseAudio();
    this.closeModal();
    this.navController.back();
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
