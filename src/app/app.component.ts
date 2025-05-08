import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd,RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonImg,MenuController, IonRow, IonCol, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { maleFemaleOutline,mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp, informationCircle, trash , ellipsisVertical} from 'ionicons/icons';
import { InternetStatusComponent } from './components/internet-status/internet-status.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { InProgressMedicalAttentionService } from './services/in-progress-medical-attention.service';
import { Keyboard } from '@capacitor/keyboard';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonCol, IonRow, HttpClientModule,RouterLink, RouterLinkActive, CommonModule, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, InternetStatusComponent,IonImg, IonRow, IonCol, IonButton],
})
export class AppComponent {
  anesthesiaTypes: Array<string>;
  private userSubscription: Subscription;
  appPages: { title: string, url: string }[] = [];
  currentPage: string;
  nameUser:any;
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private auth: AuthService,
    private router: Router,
    private menuController: MenuController,
    private inProgressRepository: InProgressMedicalAttentionService,
    ) {
    addIcons({ maleFemaleOutline, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, heartOutline, heartSharp, archiveOutline, archiveSharp, trashOutline, trashSharp, warningOutline, warningSharp, bookmarkOutline, bookmarkSharp,trash, informationCircle, ellipsisVertical});
    this.updateAppPages(router.url);
    this.nameUser = this.getUser(router.url);
    this.handleRouterEvents();
    
    // Initialize keyboard
    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-visible');
    });

    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-visible');
    });
  }


  private handleRouterEvents() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentPage = event.urlAfterRedirects;
        this.updateAppPages(this.currentPage);
        if (this.auth.checkAuthentication()) {
          this.subscribeToUser();
        }
       this.nameUser = this.getUser(this.currentPage);
      }
    });
  }

  private subscribeToUser() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    this.userSubscription = this.auth.user.subscribe(
      userData => {
        this.nameUser = userData?.account?.name ?? '';
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

 
  doLogout(){
    this.auth.logout();
  }


  private updateAppPages(currentUrl: string): void {
    if (currentUrl == '/home') {
      this.appPages = [
        { title: 'Cambio de turno', url: '/shift-handover' },
        { title: 'Sincronizacion con el servidor', url: '/home' },
      ];

    } 
    else {
      this.appPages = [
        { title: 'Pacientes pendientes', url: '/home' },
        { title: 'Cambio de turno', url: '/shift-handover' },
        { title: 'Sincronizacion con el servidor', url: '/home' },
      ];
    }
  }

  private getUser(currentUrl: string) {
    if (currentUrl !== '/login' && currentUrl !== 'undefined' && currentUrl !== '/') {
      return this.nameUser;
    } else {
      this.nameUser = 'No hemos podido identificarte';
      return this.nameUser;
    }
  }

  // menu-anestesia

  addAnesthesiaType(anestesia: string) {
    this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
      console.log(!!sm && !!sm.operatingRoomList)
      if(!!sm && !!sm.operatingRoomList) {
        const anesthesiaTypes: Array<string> = sm.operatingRoomList.anesthesiaTypes || [];
        if(!(!!anesthesiaTypes.find(it => it === anestesia))) {
          anesthesiaTypes.push(anestesia);
          
          sm.operatingRoomList.anesthesiaTypes = anesthesiaTypes;
          this.anesthesiaTypes = anesthesiaTypes;
        } else {
          const excludeAnesthesiaList = anesthesiaTypes.filter(it => it !== anestesia);

          sm.operatingRoomList.anesthesiaTypes = excludeAnesthesiaList;
          this.anesthesiaTypes = excludeAnesthesiaList;
        }
        this.inProgressRepository.saveMedicalAttention(sm,'nosync');
      }
    }).catch(e => console.error('Error consultando el servicio médico'));
  }

  menuOpened() {
    this.inProgressRepository.getInProgressMedicalAtenttion().then(sm => {
      this.anesthesiaTypes = sm.operatingRoomList.anesthesiaTypes || [];
    }).catch(e => console.error('Error consultando el servicio médico'));
  }

  closeMenu(){
    this.menuController.close('menu-anestesia');
  }

  anesthesiaSelected(anestesia: string) {
    return !!this.anesthesiaTypes && this.anesthesiaTypes.some(x => x === anestesia);
  }





}
