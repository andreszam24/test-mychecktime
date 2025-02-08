import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonAlert, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-audio-alert',
  templateUrl: './audio-alert.component.html',
  styleUrls: ['./audio-alert.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AudioAlertComponent implements OnInit, AfterViewInit {
  @ViewChild('audioPlayer') audioPlayer: ElementRef<HTMLAudioElement>;
  @ViewChild('audioAlert') audioAlert: IonAlert;
  @Input() audioSrc: string;
  @Input() textValidate: string;
  @Input() audioHeader: string;
  @Input() alertButtons: any = [];
  @Output() alertClosed = new EventEmitter<void>();

  private audioElement: HTMLAudioElement;
  isAudioEnded: boolean = false;
  isPlay: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private navCtrl: NavController) {}

  ngOnInit() {
    // this.updateAlertButtons();
  }

  ngAfterViewInit() {
    this.audioElement = this.audioPlayer.nativeElement;
    this.audioElement.src = this.audioSrc;
    this.audioElement.playbackRate = 1.3;
    
    if (this.audioAlert) {
      this.audioAlert.isOpen = true;

      this.audioElement.oncanplaythrough = () => {
        this.playAudio();
      };

      this.audioElement.addEventListener('ended', () => {
        this.isAudioEnded = true;
        this.closeAlert();
      });

      this.updateAlertButtons();
    } else {
      console.error('audioAlert no está definido.');
    }
  }

  playAudio() {
    this.audioElement
      .play()
      .then(() => {
        this.isPlay = true;
        this.updateAlertButtons();
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error reproduciendo el audio:', error);
      });
  }

  pauseAudio() {
    this.audioElement.pause();
    this.isPlay = false;
    this.updateAlertButtons();
    this.cdr.detectChanges();
  }

  restartAudio() {
    this.audioElement.currentTime = 0;
    this.playAudio();
  }

  closeAlert() {
    this.audioAlert.dismiss();
    this.pauseAudio();
    this.alertClosed.emit();
  }
  private updateAlertButtons() {
    if (!this.audioAlert) {
      console.error('audioAlert no está definido.');
      return;
    }

    this.alertButtons = [
      {
        text: this.isPlay ? 'Pausar' : 'Reproducir',
        cssClass: 'alert-button-primary',
        handler: () => {
          if (this.isPlay) {
            this.pauseAudio();
          } else {
            this.playAudio();
          }
          return false;
        },
      },
      {
        text: 'Reiniciar',
        cssClass: 'alert-button-primary',
        handler: () => {
          this.restartAudio();
          return false;
        },
      },
      {
        text: 'Volver',
        cssClass: 'alert-button-cancel space-cancel-audio',
        role: 'cancel',
        handler: () => {
          this.navCtrl.navigateForward('home');
        },
      },
    ];

    this.audioAlert.buttons = [...this.alertButtons];
  }
}
