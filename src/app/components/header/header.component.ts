import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonButtons,IonMenuButton,IonIcon,IonMenu, IonContent, IonList,IonItem,IonLabel,IonMenuToggle} from '@ionic/angular/standalone';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[RouterLink, RouterLinkActive,IonHeader,IonToolbar, IonTitle,IonButtons,IonMenuButton,IonIcon, IonMenu, IonContent, IonList, IonItem,IonLabel,IonMenuToggle]
})
export class HeaderComponent  implements OnInit {
  @Input() titleName: string ;
 

  constructor() { }

  ngOnInit() {
  }

  
}
