import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { OperationRoom } from 'src/app/models/operationRoom.model';
import { Clinic } from 'src/app/models/clinic.model';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { StatusService } from 'src/app/services/status.service';
import { WorkingAreaService } from 'src/app/services/working-area.service';
import { OperationRoomService } from 'src/app/services/operation-room.service';


@Component({
  selector: 'app-select-operating-room',
  templateUrl: './select-operating-room.page.html',
  styleUrls: ['./select-operating-room.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent]
})
export class SelectOperatingRoomPage implements OnInit {

  barcodes: Barcode[] = [];
  textItem: string = 'Por favor, escanea el código QR de la sala';
  isSupported = false;
  selectedOperationRoom: OperationRoom;
  currentClinic: Clinic;
  datepipe = new DatePipe('en-US');

  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
    private workingArea: WorkingAreaService,
    private operationRoomService:OperationRoomService
  ) { }

  ngOnInit() {
    this.startBarcodeScanner();
    this.currentClinic = this.workingArea.getClinic();
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
      this.textItem = '¡Ups! Sin permisos ¡Activa los permisos de la cámara para usar el escáner de códigos!';
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

  private async readQR() {
    const { barcodes } = await BarcodeScanner.scan();
    let qr = this.parseJSONMedicalAttentionSafely(barcodes[0].displayValue);
    if(qr && qr.operatingRoom){
      this.selectedOperationRoom = qr.operatingRoom;
      this.verifySelectedOperatingRoomQR(); 
    } else {
      throw new Error('¡Ups! Parece que ocurrió un problema con el QR');     
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

      sm.state = StatusService.SELECT_OPERATING_ROOM;
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

  goToBackPage(){
    this.navCtrl.back()
  }

}
