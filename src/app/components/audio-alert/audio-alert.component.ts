import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AlertController,IonAlert, Platform} from '@ionic/angular/standalone';


@Component({
  selector: 'app-audio-alert',
  templateUrl: './audio-alert.component.html',
  styleUrls: ['./audio-alert.component.scss'],
  standalone:true,
  imports: [IonicModule,CommonModule]
})
export class AudioAlertComponent  implements OnInit {
  @ViewChild('audioPlayer') audioPlayer: ElementRef;
  @ViewChild('audioAlert') audioAlert: IonAlert;
  @Input() audioSrc: string;
  @Input() textValidate: string;
  @Input() audioHeader: string;
  @Input() alertButtons:any={};
  @Output() alertClosed = new EventEmitter();

  constructor() {}

  ngOnInit() {}
  ngAfterViewInit() {
    this.audioAlert.isOpen = true;
    this.playAudio()
  }

  playAudio() {
    const audio = this.audioPlayer.nativeElement as HTMLAudioElement;
    audio.play();
    audio.addEventListener('ended', () => {
      this.audioAlert.dismiss();
    });
  }
}
