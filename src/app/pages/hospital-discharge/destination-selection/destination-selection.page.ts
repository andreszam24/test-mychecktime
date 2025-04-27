import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { PatientsExitList } from 'src/app/models/patients-exit-list.model';
import { Patient } from 'src/app/models/patient.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { LoadingService } from 'src/app/services/utilities/loading.service';
import { StatusService } from 'src/app/services/status.service';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { Recover } from 'src/app/models/recover.model';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { USER_KEY } from 'src/app/services/auth.service';
import { FromOperatingRoomTo } from 'src/app/models/from-operating-room-to.model';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { AlertService } from 'src/app/services/utilities/alert.service';

@Component({
  selector: 'app-destination-selection',
  templateUrl: './destination-selection.page.html',
  styleUrls: ['./destination-selection.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent,ButtonPanelComponent]
})
export class DestinationSelectionPage implements OnInit {

  model: any = {
    aldrete: null,
    bromage: null,
    ramsay: null,
    eva: null,
    nausea: null,
    destino: null,
    fechaOrdenDeSalida: null
  };
  recover: Recover;
  modelRecover: any = {
    aldrete: '-1',
    bromage: '-1',
    ramsay: '-1',
    eva: 0,
    nausea: false
  };
  patientExit: PatientsExitList;
  patient: Patient;

  datepipe = new DatePipe('en-US');
  dataUser: any;
  isSupported = false;
  scannDataForm = false;

  constructor(
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private medicalService: InProgressMedicalAttentionService,
    private modalCtrl: ModalController,
    private alertService: AlertService,
  ) { 
    this.patientExit = new PatientsExitList();
    this.recover = new Recover();
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    // this.openModal()
    this.initializeModel();
  }

  initializeModel() {
    if (this.idRole) {
      this.model = {
        aldrete: '-1',
        bromage: '-1',
        ramsay: '-1',
        eva: 0,
        nausea: false,
        destino: null,
        fechaOrdenDeSalida: this.markDepartureOrderDate()
      };
    }
  }

  
  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  async openModal() {
    if (this.idRole) {
      const textoModal = "REALIZAR ESCALAS DE RECUPERACIÓN";
      const modal = await this.modalCtrl.create({
        component: PreScanQrComponent,
        componentProps: {
          text: textoModal
        }
      });
      modal.present();
      const { data } = await modal.onWillDismiss();
      if (data === 'scan') {
        this.startBarcodeScanner();
      }else{
        this.navCtrl.navigateForward('home');
      }
    }
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  private startBarcodeScanner() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async (error) => {
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para y scanea el qr de recuperación!');
      this.navCtrl.navigateForward('home');
      return;
    }
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then(async (data) => {
      if (data.available) {
        await this.readQR();
      } else {
        await BarcodeScanner.installGoogleBarcodeScannerModule().then(async () => {
          await this.readQR();
        });
      }
    }).catch(error => {
      if (error.message === 'scan canceled.') {
         this.alertService.presentActionAlert('¡Ups! Parece que cancelaste el escaneo','Por favor, escanea el código QR de recuperación para continuar.', () => {
         this.navCtrl.navigateForward('home');
        });
    } else if (error.message.includes('device') || error.message.includes('camera')) {
      this.alertService.presentActionAlert( '¡Ups! Parece que hay un problema con tu dispositivo o cámara','Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.',() => {
        this.navCtrl.navigateForward('home');
      });
    } else {
        console.error(error.message);
        this.navCtrl.navigateForward('home');
    }

    });

  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      obj = JSON.parse(obj);
      return obj;
    }
    catch (e) {
      console.log(e);
      return {};
    }
  }

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    if(qr){
      console.log('qr escaneado!');
      this.scannDataForm = true;
    } else{
      this.alertService.presentActionAlert('¡Ups! Parece que ocurrió un problema con el QR','Por favor, escanea un código QR valido para continuar.', () => {
        this.navCtrl.navigateForward('home');
      });
    }
    
  }

  private async unsupportedBarcodeMessage() {
    this.alertService.presentBasicAlert('¡Ups!',
      'Parece que tu dispositivo no puede escanear códigos' +
      ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
    );
  }

  private async goToNextPageRecover() {
    this.recover.checkDate = new Date();
    this.recover.simpleCheckDateOrder = this.datepipe.transform(new Date(),'yyyy-MM-dd')!;
    this.recover.simpleCheckHourOrder = this.datepipe.transform(new Date(),'HH:mm:ss')!;

    await this.loadingService.showLoadingBasic("Cargando...");
    this.mapViewToModelRecover();
    const fromRoomTo = new FromOperatingRoomTo();
    fromRoomTo.status = StatusService.TERMINADO;
    fromRoomTo.to = "recuperacion";
    fromRoomTo.checkDate = new Date();
    fromRoomTo.simpleCheckDate = this.datepipe.transform(new Date(),'yyyy-MM-dd')!;
    fromRoomTo.simpleCheckHour = this.datepipe.transform(new Date(),'HH:mm:ss')!;
    fromRoomTo.recover = this.recover;
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.exitOperatingRoomList.fromOperatingRoomTo = fromRoomTo;
      sm.state = this.destinationStatus();
      this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
          return result
        }).catch((err) => {
          console.log('errerrerr --->>>', err);
          this.loadingService.dismiss();
        });
    }).catch((err) => {
      console.error('Error consultando la atencion médica ---> goToNextPageRecover', err);
      this.loadingService.dismiss();
    });
  }

  private mapViewToModelRecover(): Recover {
    this.recover.aldrete = this.valorNumerico(this.modelRecover.aldrete);
    this.recover.bromage = this.valorNumerico(this.modelRecover.bromage);
    this.recover.ramsay = this.valorNumerico(this.modelRecover.ramsay);
    this.recover.eva = this.modelRecover.eva;
    this.recover.nausea = this.modelRecover.nausea;
    this.recover.state = StatusService.TERMINADO;
    return this.recover;
  }

  private valorNumerico(valor: any): number {
    return valor === '' ? null : valor;
  }

  async goToNextPage() {
    this.patientExit.destination = this.model.destino;
    this.patientExit.state = StatusService.SELECCION_DESTINO;
    this.patientExit.recover = this.mapViewToModel();
    await this.loadingService.showLoadingBasic("Cargando...");

    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.patientsExit = this.patientExit;
      sm.state = this.destinationStatus();
      this.updateMedicalService(sm, this.loadingService);

    }).catch(e => {
      this.loadingService.dismiss();
      console.log('Error consultando la atencion médica',e);
    }).finally(() => {
      this.loadingService.dismiss();
    });
  }

  private mapViewToModel(): Recover {
    const recover = new Recover();
    recover.aldrete = this.numericValue(this.model.aldrete);
    recover.bromage = this.numericValue(this.model.bromage);
    recover.ramsay = this.numericValue(this.model.ramsay);
    recover.eva = this.model.eva;
    recover.nausea = this.model.nausea;
    recover.state = StatusService.TERMINADO;
    recover.checkDate = this.model.fechaOrdenDeSalida;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate,'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate,'HH:mm:ss')!;
    return recover;
  }

  private numericValue(valor: any): number {
    return valor === '' ? null : valor;
  }

  private redirectToSelectedPage(): void  {
    if(this.model.destino === 'CASA') {
      this.navCtrl.navigateForward('/home-destination');
    } else if(this.model.destino === 'HOSPITALIZACION') {
      this.navCtrl.navigateForward('/hospitalization-destination');
    } else if(this.model.destino === 'UCI') {
      this.navCtrl.navigateForward('/uci-destination');
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      this.navCtrl.navigateForward('/decease-destination');
    } else if(this.model.destino === 'CIRUGIA') {
      this.navCtrl.navigateForward('/surgery-destination');
    }
  }

  private destinationStatus(): string {
    if(this.model.destino === 'CASA') {
      return StatusService.DESTINO_CASA;
    } else if(this.model.destino === 'HOSPITALIZACION') {
      return StatusService.DESTINO_HOSPITALIZACION;
    } else if(this.model.destino === 'UCI') {
      return StatusService.DESTINO_UCI;
    } else if(this.model.destino === 'SALA_DE_PAZ') {
      return StatusService.DESTINO_SALA_DE_PAZ;
    } else if(this.model.destino === 'CIRUGIA') {
      return StatusService.DESTINO_CIRUGIA;
    }
    return '';
  }

  private updateMedicalService(sm: MedicalAttention, loading: any) {
    this.medicalService.saveMedicalAttention(sm, 'sync')
    .then(result => {
        loading.dismiss();
        if(result) {
          if (this.idRole) {
            this.goToNextPageRecover().then(() => {
              this.redirectToSelectedPage();
            }).finally(() => {
              this.loadingService.dismiss();
            });
          } else {
            this.redirectToSelectedPage();
          }
        }
    }).catch(err => {
      loading.dismiss();
      console.error('No se pudo guardar el servicio médico',err);
    });
  }

  markDepartureOrderDate() {
    if (this.model.fechaOrdenDeSalida === null) {
      this.model.fechaOrdenDeSalida = new Date();
    }
  }

  isValid() {
    const oneOfThree = this.isSetted(this.model.bromage) || this.isSetted(this.model.ramsay) || this.isSetted(this.model.aldrete);
    return this.isSetted(this.model.eva) && oneOfThree && this.model.nausea !== null && this.model.destino;
  }

  private isSetted(valor: any) {
    return valor !== undefined && valor !== null && valor !== '';
  }

}
