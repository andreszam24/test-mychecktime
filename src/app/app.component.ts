import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, NavigationEnd,RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonImg } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp, informationCircle, trash } from 'ionicons/icons';
import { InternetStatusComponent } from './components/internet-status/internet-status.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';



@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [HttpClientModule,RouterLink, RouterLinkActive, CommonModule, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, InternetStatusComponent,IonImg],
})
export class AppComponent {
  appPages: { title: string, url: string }[] = [];
  currentPage: string;
  nameUser:any;
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private auth: AuthService,private router: Router) {
    addIcons({ mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp,trash, informationCircle });
    this.updateAppPages(router.url);
    this.nameUser = this.getUser(router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPage = event.urlAfterRedirects;
        console.log('router.events',this.currentPage)
        this.updateAppPages(this.currentPage); 
        this.nameUser = this.getUser(this.currentPage);
      }
    });
  }

 
  doLogout(){
    this.auth.logout();
  }


  private updateAppPages(currentUrl: string): void {
    if (currentUrl == '/home') {
      this.appPages = [
        { title: 'cambio de Turno', url: '/' },
        { title: 'Sincronizacion con el servidor', url: '/' },
      ];
    } 
    else {
      this.appPages = [
        { title: 'Pacientes Pendientes', url: '/home' },
        { title: 'cambio de Turno', url: '/' },
        { title: 'Sincronizacion con el servidor', url: '/' },
      ];
    }
  }

  private getUser(currentUrl: string){
    if(currentUrl !== '/login' && currentUrl !== 'undefined' && currentUrl !== '/' ){
      this.auth.user.subscribe(
        userData => {
          console.log('userData: ',userData)
          this.nameUser = userData.account.name;
          console.log(this.nameUser)
        }
      )
      console.log(this.nameUser)
      return this.nameUser;
    } else{
      return this.nameUser = 'nombre anestesiologo'
    } 
  }


}
