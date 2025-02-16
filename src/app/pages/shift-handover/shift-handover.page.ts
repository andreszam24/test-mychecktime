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
import { MedicalAttention } from 'src/app/models/medical-attention.model';

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
  attentionsInProgress: { attention: MedicalAttention; isSelected: boolean }[] = [];
  attentionsToTransfer: MedicalAttention[] = [];


  constructor(private loadingService: LoadingService,
    private anesthesiologistService: AnesthesiologistService,
    private alertService: AlertService,
    private navCtrl: NavController,
    private inProgressRepository: InProgressMedicalAttentionService,
    private workingAreaRepository: WorkingAreaService,
    private authService: AuthService) { }

  ngOnInit() {
    this.inProgressRepository.getPendingMedicalAtenttionsByClinic(this.workingAreaRepository.getClinic().id, this.authService.getLoggedAccount().id).then(
      services => {
        this.servicesToChangeCount = services.length;
        services.forEach(service => {
          this.attentionsInProgress.push({ attention: service, isSelected: false });
        });
      }
    ).catch(() => {
        this.servicesToChangeCount = 0;
        console.error('No se pudo consultar el número de servicios pendientes');
      });
  }

  selectAttentionToTransfer(attention: MedicalAttention) {
    const index = this.attentionsInProgress.findIndex(item => item.attention._id === attention._id);

    if (index !== -1) {
      this.attentionsInProgress[index].isSelected = !this.attentionsInProgress[index].isSelected;
    }
    console.log("In progress: ", this.attentionsInProgress)
    if (!this.attentionsToTransfer.includes(attention)) {
      this.attentionsToTransfer.push(attention);
    } else {
      this.attentionsToTransfer = this.attentionsToTransfer.filter(att => att._id !== attention._id);
    }
    console.log("A transferir: ", this.attentionsToTransfer);
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

    const futureAnes = new AnesthesiologistProfile();
    futureAnes.id = this.selectedAnes.id;
    futureAnes.name = this.selectedAnes.name;
    futureAnes.lastname = this.selectedAnes.lastname;
    futureAnes.lastnameS = this.selectedAnes.lastnameS;
    futureAnes.gender = this.selectedAnes.gender;
    futureAnes.phone = this.selectedAnes.phone;
    futureAnes.email = this.selectedAnes.email;
    futureAnes.status = this.selectedAnes.status;

    this.attentionsToTransfer.forEach(s => {
      s.currentAnesthesiologist = futureAnes;
      s.anestehsiologist.push(this.selectedAnes);
    });
    
    this.inProgressRepository.saveManyRemoteRepository(this.attentionsToTransfer)
    .subscribe(() => {
      this.inProgressRepository.removeAttentionsFromProgressService(this.attentionsToTransfer);
      this.alertService.presentBasicAlert('¡Bien hecho!', 'Cambio de turno guardado correctamente.');
      this.loadingService.dismiss();
      this.goToPatientHall();
    }), (() => {
      this.loadingService.dismiss();
      this.alertService.presentBasicAlert('Oops!', 'Parece algo salio mal mientras se guardaba el cambio de turno');
    });

  }

  goToBackPage() {
    this.navCtrl.back()
  }

  goToPatientHall() {
    this.navCtrl.navigateForward('/home');
  }

}
