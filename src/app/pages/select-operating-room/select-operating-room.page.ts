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
import {
  AndroidSettings,
  IOSSettings,
  NativeSettings,
} from 'capacitor-native-settings';
import { MedicalAttention } from 'src/app/models/medical-attention.model';
import { ActivatedRoute } from '@angular/router';
import { USER_KEY } from 'src/app/services/auth.service';

@Component({
  selector: 'app-select-operating-room',
  templateUrl: './select-operating-room.page.html',
  styleUrls: ['./select-operating-room.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HeaderComponent,
    ButtonPanelComponent,
  ],
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
    private operationRoomService: OperationRoomService,
    private modalCtrl: ModalController,
    private alertService: AlertService,
    private route: ActivatedRoute
  ) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  ngOnInit() {
    this.openModal();
    this.currentClinic = this.workingArea.getClinic();
    this.dni = this.route.snapshot.paramMap.get('dni');
  }

  get idRole(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData?.roles?.[0]?.id === 4;
  }

  async openModal() {
    const textoModal =
      'LISTA DE VERIFICACIÓN EN SALA. ANTES DE CUALQUIER INTERVENCIÓN, VERIFIQUE QUE ESTE EL CIRUJANO Y LA INSTRUMENTADORA.';
    const modal = await this.modalCtrl.create({
      component: PreScanQrComponent,
      componentProps: {
        text: textoModal,
      },
    });
    modal.present();

    const { data } = await modal.onWillDismiss();

    if (data === 'scan') {
      this.startBarcodeScanner();
    } else if (data === 'demo') {
      this.showDemoOptions();
    } else {
      this.navCtrl.navigateForward('home');
    }
  }

  private startBarcodeScanner() {
    BarcodeScanner.isSupported()
      .then((result) => {
        this.isSupported = result.supported;
        this.scan();
      })
      .catch(async (error) => {
        console.error(error.message);
        await this.unsupportedBarcodeMessage();
      });
  }

  handleOpenPermission = async () => {
    NativeSettings.open({
      optionAndroid: AndroidSettings.ApplicationDetails,
      optionIOS: IOSSettings.App,
    });
    this.navCtrl.navigateForward('home');
  };

  async scan(): Promise<void> {
    console.log('📱 Iniciando proceso de escaneo en select-operating-room...');
    
    try {
      // Verificar soporte del dispositivo primero
      const supportResult = await BarcodeScanner.isSupported();
      console.log('🔍 Soporte del dispositivo:', supportResult);
      
      if (!supportResult.supported) {
        console.log('❌ Dispositivo no soporta escaneo de códigos');
        this.textItem = '¡Ups! Parece que tu dispositivo no puede escanear códigos con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.';
        return;
      }

      const granted = await this.requestPermissions();
      console.log('🔐 Permisos de cámara:', granted);
      
      if (!granted) {
        console.log('❌ Permisos de cámara denegados');
        this.alertService.presentActionAlertCustom(
          '¡Ups! Sin permisos',
          '¡Activa los permisos de la cámara para usar el escáner de códigos!',
          this.handleOpenPermission,
          () => this.navCtrl.navigateForward('home')
        );
        return;
      }

      // Detectar plataforma y usar el método apropiado
      const platform = await import('@capacitor/core').then(m => m.Capacitor.getPlatform());
      console.log('📱 Plataforma detectada:', platform);
      
      if (platform === 'ios') {
        console.log('🍎 iOS detectado, usando escáner nativo...');
        await this.readQR();
      } else {
        // Para Android, verificar el módulo de Google
        console.log('🤖 Android detectado, verificando módulo de Google...');
        await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
          .then(async (data) => {
            console.log('📦 Estado del módulo de Google:', data);
            if (data.available) {
              console.log('✅ Módulo de Google disponible, iniciando escaneo...');
              await this.readQR();
            } else {
              console.log('📥 Instalando módulo de Google...');
              await BarcodeScanner.installGoogleBarcodeScannerModule().then(
                async () => {
                  console.log('✅ Módulo de Google instalado, iniciando escaneo...');
                  await this.readQR();
                }
              );
            }
          })
          .catch((error) => {
            console.error('❌ Error verificando módulo de escaneo:', error);
            this.textItem = 'No se pudo inicializar el escáner. Por favor, intenta nuevamente.';
          });
      }
    } catch (error) {
      console.error('💥 Error en scan select-operating-room:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'scan canceled.') {
        this.textItem = '¡Ups! Parece que cancelaste el escaneo. Por favor, escanea el código QR de la sala para continuar.';
      } else if (errorMessage.includes('device') || errorMessage.includes('camera')) {
        this.textItem = '¡Ups! Parece que hay un problema con tu dispositivo o cámara. Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.';
      } else {
        console.error('Error inesperado:', errorMessage);
        this.textItem = 'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.';
      }
    }
  }

  private loadServicesFromLocalRepository(): MedicalAttention[] {
    return JSON.parse(localStorage.getItem(this.inProgressServicesKey) ?? '[]');
  }
  private async readQR() {
    try {
      console.log('📷 Iniciando escaneo de QR en select-operating-room...');
      
      // Configurar opciones de escaneo específicas para iOS
      const scanOptions = {
        formats: ['QR_CODE', 'PDF_417'] as any[],
        // En iOS, no necesitamos configuraciones adicionales
      };
      
      console.log('⚙️ Opciones de escaneo:', scanOptions);
      
      const result = await BarcodeScanner.scan(scanOptions);
      console.log('📊 Resultado del escaneo:', result);
      
      if (!result.barcodes || result.barcodes.length === 0) {
        console.log('❌ No se detectaron códigos en el escaneo');
        this.textItem = 'No se pudo detectar ningún código QR. Por favor, asegúrate de que el código esté bien visible y vuelve a intentar.';
        return;
      }
      
      const barcode = result.barcodes[0];
      console.log('🔍 Código detectado:', barcode);
      
      let qr = this.parseJSONMedicalAttentionSafely(barcode.displayValue);
      console.log('📋 QR parseado:', qr);
      
      const list = this.loadServicesFromLocalRepository();
      // Este estado es para preguntar si ya existe alguien en este
      // estado para no dejar ingresar a otro usuario a este estado
      const states = [
        'OperatingRoomList',
        'EndSurgery',
        'ExitOperatingRoomList',
        'EndStartAnesthesia',
      ];

      if (qr && qr.operatingRoom) {
        console.log('✅ QR válido, verificando disponibilidad de sala...');
        const isRoomOccupied = list.some((item) => {
          const isMatchingState = states.includes(item.state);

          return (
            item.operatingRoom?.name?.toLowerCase() ===
              qr.operatingRoom?.name?.toLowerCase() &&
            isMatchingState &&
            item.patient.dni !== this.dni
          );
        });

        if (isRoomOccupied) {
          console.log('❌ Sala ocupada:', qr.operatingRoom.name);
          this.textItem = 'La sala se encuentra ocupada, por favor gestione el paciente anterior.';
          this.alertService.presentActionAlertCustom(
            '¡Ups!',
            `La sala "${qr.operatingRoom.name}" ya está ocupada por otro paciente.`,
            this.scan,
            () => this.navCtrl.navigateForward('home'),
            'Volver a scanear'
          );
        } else {
          console.log('✅ Sala disponible, procesando selección...');
          this.selectedOperationRoom = qr.operatingRoom;
          this.verifySelectedOperatingRoomQR();
        }
      } else {
        console.log('❌ QR inválido o sin datos de sala de operaciones');
        this.textItem = '¡Ups! Parece que ocurrió un problema con el QR. Por favor, escanea un código QR válido para continuar.';
      }
    } catch (error) {
      console.error('💥 Error en readQR select-operating-room:', error);
      
      // Manejar errores específicos
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('camera')) {
        this.textItem = 'No se pudo acceder a la cámara. Por favor, verifica los permisos en la configuración del dispositivo.';
      } else if (errorMessage.includes('permission')) {
        this.textItem = 'La aplicación no tiene permisos para usar la cámara. Por favor, habilita los permisos en la configuración.';
      } else {
        this.textItem = 'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.';
      }
    }
  }

  verifySelectedOperatingRoomQR() {
    try {
      console.log('🔍 Verificando sala de operaciones seleccionada...');
      console.log('🏥 Sala seleccionada:', this.selectedOperationRoom);
      console.log('🏥 Clínica actual:', this.currentClinic);
      
      if (this.doesMatch()) {
        console.log('✅ Sala válida, continuando...');
        this.goToNextPage();
      } else {
        console.log('❌ Sala no válida para esta clínica');
        this.textItem = '¡Ups! Parece que ocurrió un problema, el contenido del código QR no corresponde a una sala válida para esta clínica';
      }
    } catch (error) {
      console.error('💥 Error en verifySelectedOperatingRoomQR:', error);
      this.textItem = 'Error verificando la sala de operaciones. Por favor, intenta nuevamente.';
    }
  }

  doesMatch(): boolean {
    let operationRoomsLists = this.operationRoomService.getLocalRooms();
    const matchingOperationRoom = operationRoomsLists.find((operationRoom) => {
      console.log('Comparando con sala:', operationRoom);

      const isMatch =
        operationRoom.id === this.selectedOperationRoom.id &&
        operationRoom.clinic_id === this.selectedOperationRoom.clinic_id &&
        operationRoom.clinic?.name?.toLowerCase() ===
          this.selectedOperationRoom.clinic?.name?.toLowerCase() &&
        operationRoom?.name?.toLowerCase() ===
          this.selectedOperationRoom?.name?.toLowerCase();
      return isMatch;
    });

    if (matchingOperationRoom) {
      this.selectedOperationRoom = matchingOperationRoom;
      return true;
    } else {
      return false;
    }
  }

  goToNextPage() {
    this.medicalService
      .getInProgressMedicalAtenttion()
      .then((sm) => {
        sm.operatingRoom = this.selectedOperationRoom;
        sm.idOperatingRoom = this.selectedOperationRoom.id;

        sm.operatingRoom.updated_at = this.datepipe.transform(
          sm.operatingRoom.updated_at,
          "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        )!;
        sm.operatingRoom.created_at = this.datepipe.transform(
          sm.operatingRoom.created_at,
          "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        )!;

        sm.operatingRoom.clinic.updated_at = this.datepipe.transform(
          sm.operatingRoom.clinic.updated_at,
          "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        )!;
        sm.operatingRoom.clinic.created_at = this.datepipe.transform(
          sm.operatingRoom.clinic.created_at,
          "yyyy-MM-dd'T'HH:mm:ss.SSSZ"
        )!;

        sm.state = StatusService.ADMISSION_LIST;
        this.medicalService
          .saveMedicalAttention(sm, 'sync')
          .then((result) => {
            if (result) {
              console.log(result);
              this.navCtrl.navigateForward('check-patient-info');
            }
          })
          .catch(() => console.error('No se pudo guardar el servicio médico'));
      })
      .catch(() => console.log('Error consultando la atencion médica'));
  }

  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  private async unsupportedBarcodeMessage() {
    this.textItem =
      '¡Ups! Parece que tu dispositivo no puede escanear códigos con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.';
  }

  parseJSONMedicalAttentionSafely(obj: any) {
    try {
      obj = JSON.parse(obj);
      return obj;
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  toContinue() {
    this.scan();
  }

  showDemoOptions() {
    const demoQR = {
      operatingRoom: {
        id: 48,
        name: 'Sala 3',
        clinic_id: 15,
        clinic: {
          id: 15,
          name: 'CLINICA VISUAL Y AUDITIVA INCS'
        }
      } as any,
    };
    console.log('Datos demo QR:', demoQR);

    this.selectedOperationRoom = demoQR.operatingRoom;
    this.verifySelectedOperatingRoomQR();
  }
}
