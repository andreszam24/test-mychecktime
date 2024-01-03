import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon,IonItem, IonLabel,} from '@ionic/angular/standalone';



@Component({
  selector: 'app-app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss'],
  standalone:true,
  imports: [CommonModule,IonIcon,IonItem,IonButton,IonLabel]
})


export class AppSpinnerComponent  implements OnInit {

  @Input() label: string = '';
  @Output() countChange = new EventEmitter();  
  counter: number = 0;

  constructor() { }

  ngOnInit() {}

  @Input() get count(): number {
    return this.count;
  }

  set count(val) {
    this.counter = val;
  }

  increment() {
    this.counter++;
    this.countChange.emit(this.counter);
  }

  decrement() {
    if(this.counter > 0) {
      this.counter--;
      this.countChange.emit(this.counter);
    }
  }

}
