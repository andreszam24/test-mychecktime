import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons,IonMenuButton,IonIcon} from '@ionic/angular/standalone';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[IonHeader,IonToolbar, IonTitle,IonButtons,IonMenuButton,IonIcon]
})
export class HeaderComponent  implements OnInit {
  @Input() titleName: string = '';
  constructor() { }

  ngOnInit() {}

}
