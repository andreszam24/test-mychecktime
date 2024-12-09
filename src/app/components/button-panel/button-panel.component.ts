import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-button-panel',
  templateUrl: './button-panel.component.html',
  styleUrls: ['./button-panel.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ButtonPanelComponent implements OnInit {
  @Output() buttonClicked = new EventEmitter<void>();
  @Input() disabled: boolean = true;
  @Input() customBackFunction?: () => void;

  constructor(private navCtrl: NavController) {}

  ngOnInit() {}

  goToBackPage() {
    this.navCtrl.back();
  }

  onClick() {
    this.buttonClicked.emit();
  }

  onBackClick() {
    if (this.customBackFunction) {
      this.customBackFunction();
    } else {
      this.goToBackPage();
    }
  }
}
