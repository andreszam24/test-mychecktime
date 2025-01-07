import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { OperationRoom } from 'src/app/models/operationRoom.model';
import { Clinic } from 'src/app/models/clinic.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { WorkingAreaService } from 'src/app/services/working-area.service';
import { OperationRoomService } from 'src/app/services/operation-room.service';
import { PreScanQrComponent } from 'src/app/components/pre-scan-qr/pre-scan-qr.component';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { AlertService } from 'src/app/services/utilities/alert.service';
import { AndroidSettings, IOSSettings, NativeSettings } from 'capacitor-native-settings';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { ActivatedRoute } from '@angular/router';
import { USER_KEY } from 'src/app/services/auth.service';


@Component({
  selector: 'app-select-operating-room',
  templateUrl: './select-operating-room.page.html',
  styleUrls: ['./select-operating-room.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, ButtonPanelComponent]
})
export class SelectOperatingRoomPage implements OnInit {

  barcodes: Barcode[] = [];
  textItem: string = '';
  isSupported = false;
  selectedOperationRoom: OperationRoom;
  currentClinic: Clinic;
  datepipe = new DatePipe('en-US');
  private inProgressServicesKey = 'inprogress_services';
  dni: string | null;
  dataUser: any;

  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private workingArea: WorkingAreaService,
    private operationRoomService:OperationRoomService,
    private modalCtrl: ModalController,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) { 
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.openModal()
    this.currentClinic = this.workingArea.getClinic();
    this.dni = this.route.snapshot.paramMap.get('dni');
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  async openModal() {
    const textoModal = "LISTA DE VERIFICACIÓN EN SALA. ANTES DE CUALQUIER INTERVENCIÓN, VERIFIQUE QUE ESTE EL CIRUJANO Y LA INSTRUMENTADORA.";
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

  private startBarcodeScanner() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async (error) => {
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }

  handleOpenPermission = async () => {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
    this.navCtrl.navigateForward('home')
  };

  async scan(): Promise<void> {
    const granted = await this.requestPermissions();
    if (!granted) {
      this.alertService.presentActionAlertCustom(
        '¡Ups! Sin permisos',
        '¡Activa los permisos de la cámara para usar el escáner de códigos!',
        this.handleOpenPermission,
        () => this.navCtrl.navigateForward('home'),
      );
      return;
    }
    // NOTE: To avoid that scan it doesn't work, you may use 5.0.3 version or higher: npm i @capacitor-mlkit/barcode-scanning@5.0.3
    //Check if the Google ML Kit barcode scanner is available
    await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable().then(async (data) => {
      if (data.available) {
        // Start the barcode scanner
        await this.readQR();
      } else {
        // Install the Google ML Kit barcode scanner
        await BarcodeScanner.installGoogleBarcodeScannerModule().then(async () => {
          await this.readQR();
        });
      }
    }).catch(error => {
      if (error.message === 'scan canceled.') {
        this.textItem = '¡Ups! Parece que cancelaste el escaneo. Por favor, escanea el código QR de la sala para continuar.';
    } else if (error.message.includes('device') || error.message.includes('camera')) {
        this.textItem = '¡Ups! Parece que hay un problema con tu dispositivo o cámara. Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.';
    } else {
        console.error(error.message);
        this.textItem = error.message;
    }
    });

  }

  private loadServicesFromLocalRepository(): MedicalAttention[] {
    return JSON.parse(localStorage.getItem(this.inProgressServicesKey) ?? '[]');
  }
  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
  
    const list = this.loadServicesFromLocalRepository();
  
    const states = [
      'OperatingRoomList',
      'EndSurgery',
      'ExitOperatingRoomList',
    ];
  
    if (qr && qr.operatingRoom) {
      const isRoomOccupied = list.some((item) => {
        const isMatchingState = this.idRole
          ? item.state === 'FromOperatingRoomTo'
          : states.includes(item.state);
  
        return (
          item.operatingRoom?.name === qr.operatingRoom.name &&
          isMatchingState &&
          item.patient.dni !== this.dni
        );
      });
  
      if (isRoomOccupied) {
        this.textItem = 'La sala se encuentra ocupada, por favor gestione el paciente.';
        this.alertService.presentActionAlertCustom(
          '¡Ups!',
          `La sala "${qr.operatingRoom.name}" ya está ocupada por otro paciente.`,
          this.scan,
          () => this.navCtrl.navigateForward('home'),
          'Volver a scanear'
        );
      } else {
        this.selectedOperationRoom = qr.operatingRoom;
        this.verifySelectedOperatingRoomQR();
      }
    } else {
      throw new Error(
        '¡Ups! Parece que ocurrió un problema con el QR. Por favor, escanea un código QR válido para continuar.'
      );
    }
  }
  
  

  verifySelectedOperatingRoomQR(){
    if(this.doesMatch()){
      this.goToNextPage();
    } else {
      throw new Error('¡Ups! Parece que ocurrió un problema, el contenido del código QR no corresponde a una sala valida para esta clinica');     
    }
  }

  doesMatch(): boolean {
    let operationRoomsLists = this.operationRoomService.getLocalRooms();
    const matchingOperationRoom = operationRoomsLists.find(operationRoom => 
        operationRoom.id === this.selectedOperationRoom.id && operationRoom.clinic_id === this.selectedOperationRoom.clinic_id && operationRoom.clinic.name === this.selectedOperationRoom.clinic.name
    );
    if (matchingOperationRoom) {
        this.selectedOperationRoom = matchingOperationRoom;
        return true;
    } else {
        return false;
    }
}


  goToNextPage() {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      sm.operatingRoom = this.selectedOperationRoom;
      sm.idOperatingRoom = this.selectedOperationRoom.id;

      sm.operatingRoom.updated_at = this.datepipe.transform(sm.operatingRoom.updated_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ')!;
      sm.operatingRoom.created_at = this.datepipe.transform(sm.operatingRoom.created_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ')!;

      sm.operatingRoom.clinic.updated_at = this.datepipe.transform(sm.operatingRoom.clinic.updated_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ')!;
      sm.operatingRoom.clinic.created_at = this.datepipe.transform(sm.operatingRoom.clinic.created_at, 'yyyy-MM-dd\'T\'HH:mm:ss.SSSZ')!;

      sm.state = StatusService.ADMISSION_LIST;
     this.medicalService.saveMedicalAttention(sm, 'sync')
        .then(result => {
            if(result) {
              console.log(result)
              this.navCtrl.navigateForward('check-patient-info');
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion médica'));

  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  private async unsupportedBarcodeMessage() {
    this.textItem = '¡Ups! Parece que tu dispositivo no puede escanear códigos con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.';
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

  toContinue(){
    this.scan();
  }

}
