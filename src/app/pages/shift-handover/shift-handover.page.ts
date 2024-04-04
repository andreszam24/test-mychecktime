import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { AnesthesiologistProfile } from '../../models/anesthesiologist-profile.model';
import { LoadingService } from '../../services/utilities/loading.service';
import { AnesthesiologistService } from '../../services/anesthesiologist.service';
import { catchError, of } from 'rxjs';
import { AlertService } from '../../services/utilities/alert.service';
import { InProgressMedicalAttentionService } from '../../services/in-progress-medical-attention.service';
import { WorkingAreaService } from '../../services/working-area.service';
import { AuthService } from '../../services/auth.service';
import { IonAvatar, IonCardContent, IonCardHeader, IonCol, IonIcon, IonInput, IonItem, IonLabel, IonRow, IonSearchbar, IonSelect, IonText } from '@ionic/angular/standalone';
import { InternetStatusComponent } from '../../components/internet-status/internet-status.component';
import { HeaderComponent } from '../../components/header/header.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';

@Component({
  selector: 'app-shift-handover',
  templateUrl: './shift-handover.page.html',
  styleUrls: ['./shift-handover.page.scss'],
  standalone: true,
  imports: [IonItem, IonSearchbar, IonAvatar, IonLabel, IonText, IonInput, IonIcon, IonSelect, IonicModule, FormsModule, InternetStatusComponent, CommonModule, HeaderComponent, IonCardHeader, IonCardContent, IonRow, IonCol, ButtonPanelComponent],
})
export class ShiftHandoverPage implements OnInit {

  anesthesiologisList: AnesthesiologistProfile[] = [];
  resultsSearchigAnesthesiologist = [...this.anesthesiologisList];
  selectedAnes: AnesthesiologistProfile;
  servicesToChangeCount: number = 0;

  constructor(private loadingService: LoadingService,
    private anesthesiologistService: AnesthesiologistService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private inProgressRepository: InProgressMedicalAttentionService,
    private workingAreaRepository: WorkingAreaService,
    private authService: AuthService) { }

  ngOnInit() {
    this.inProgressRepository.getPendingMedicalAtenttionsByClinic(this.workingAreaRepository.getClinic().id, this.authService.getLoggedAccount().id).then(
      services => this.servicesToChangeCount = services.length
    ).catch(() => {
        this.servicesToChangeCount = 0;
        console.error('No se pudo consultar el número de servicios pendientes');
      });
  }

  handleInputAnesthesiologistName(event: any) {
    const query = event.target.value.toLowerCase().trim();
    if (query != '' && query.length > 3) {
      this.resultsSearchigAnesthesiologist = [];
      this.anesthesiologistSearchByName(query);
    }
  }

  anesthesiologistSearchByName(name: string) {
    this.loadingService.showLoadingBasic("Cargando...");
    this.anesthesiologistService.toSearchByName(name).pipe(
      catchError((error) => {
        this.loadingService.dismiss();
        console.error('Ups! Algo salio mal al consultar los anestesiologos: ', error);
        return of(null);
      })
    )
      .subscribe((result) => {
        if (result && result.length > 0) {
          this.loadingService.dismiss();
          this.anesthesiologisList = result;
          this.resultsSearchigAnesthesiologist = this.anesthesiologisList.filter((anesthesiologist) => anesthesiologist.name.toLowerCase().indexOf(name) > -1);
        } else {
          this.alertService.presentBasicAlert('Oops!', 'Parece que a quien buscas no se encuentra. Por favor intenta con otra búsqueda.');
          this.loadingService.dismiss();
        }
      });
  }

  anesthesiologistSelected(anesthesiologist: AnesthesiologistProfile) {
    this.selectedAnes = anesthesiologist;
    this.resultsSearchigAnesthesiologist = [];
  }

  shiftHandover() {
    this.loadingService.showLoadingBasic("Cargando...");

    this.inProgressRepository.getPendingMedicalAtenttionsByClinic(this.workingAreaRepository.getClinic().id, this.authService.getLoggedAccount().id).then(
      services => {

        const futureAnes = new AnesthesiologistProfile();
        futureAnes.id = this.selectedAnes.id;
        futureAnes.name = this.selectedAnes.name;
        futureAnes.lastname = this.selectedAnes.lastname;
        futureAnes.lastnameS = this.selectedAnes.lastnameS;
        futureAnes.gender = this.selectedAnes.gender;
        futureAnes.phone = this.selectedAnes.phone;
        futureAnes.email = this.selectedAnes.email;
        futureAnes.status = this.selectedAnes.status;

        services.forEach(s => {
          s.currentAnesthesiologist = futureAnes;
          s.anestehsiologist.push(this.selectedAnes);
        });

        this.inProgressRepository.saveManyRemoteRepository(services)
          .subscribe(() => {
            this.inProgressRepository.clearInProgressServices();
            this.alertService.presentBasicAlert('¡Bien hecho!', 'Cambio de turno guardado correctamente.');
            this.loadingService.dismiss();
            this.goToPatientHall();
          }), (() => {
            this.loadingService.dismiss();
            this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal mientras se guardaba el cambio de turno');
          });
      }
    ).catch(() => {
      this.loadingService.dismiss();
      console.error('No se pudo consultar la lista de servicios pendientes');
    });
  }

  goToBackPage() {
    this.navCtrl.back()
  }

  goToPatientHall() {
    this.navCtrl.navigateForward('/home');
  }

}
