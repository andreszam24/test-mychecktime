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
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent, ButtonPanelComponent]
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
    this.model = {
      aldrete: '-1',
      bromage: '-1',
      ramsay: '-1',
      eva: 0,
      nausea: false,
      destino: null,
      fechaOrdenDeSalida: null
    };
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
      } else {
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
    console.log('📱 Iniciando proceso de escaneo en destination-selection...');
    
    try {
      // Verificar soporte del dispositivo primero
      const supportResult = await BarcodeScanner.isSupported();
      console.log('🔍 Soporte del dispositivo:', supportResult);
      
      if (!supportResult.supported) {
        console.log('❌ Dispositivo no soporta escaneo de códigos');
        await this.unsupportedBarcodeMessage();
        this.navCtrl.navigateForward('home');
        return;
      }

      const granted = await this.requestPermissions();
      console.log('🔐 Permisos de cámara:', granted);
      
      if (!granted) {
        console.log('❌ Permisos de cámara denegados');
        this.alertService.presentBasicAlert('¡Ups! Sin permisos', '¡Activa los permisos de la cámara para y scanea el qr de recuperación!');
        this.navCtrl.navigateForward('home');
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
            this.alertService.presentBasicAlert(
              'Error de escaneo',
              'No se pudo inicializar el escáner. Por favor, intenta nuevamente.'
            );
            this.navCtrl.navigateForward('home');
          });
      }
    } catch (error) {
      console.error('💥 Error en scan destination-selection:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'scan canceled.') {
        this.alertService.presentActionAlert('¡Ups! Parece que cancelaste el escaneo', 'Por favor, escanea el código QR de recuperación para continuar.', () => {
          this.navCtrl.navigateForward('home');
        });
      } else if (errorMessage.includes('device') || errorMessage.includes('camera')) {
        this.alertService.presentActionAlert('¡Ups! Parece que hay un problema con tu dispositivo o cámara', 'Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.', () => {
          this.navCtrl.navigateForward('home');
        });
      } else {
        console.error('Error inesperado:', errorMessage);
        this.alertService.presentBasicAlert(
          'Error de escaneo',
          'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.'
        );
        this.navCtrl.navigateForward('home');
      }
    }
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
    try {
      console.log('📷 Iniciando escaneo de QR en destination-selection...');
      
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
        this.alertService.presentActionAlert(
          'No se detectó código',
          'No se pudo detectar ningún código QR. Por favor, asegúrate de que el código esté bien visible y vuelve a intentar.',
          () => {
            this.navCtrl.navigateForward('home');
          }
        );
        return;
      }
      
      const barcode = result.barcodes[0];
      console.log('🔍 Código detectado:', barcode);
      
      let qr = this.parseJSONMedicalAttentionSafely(barcode.displayValue);
      console.log('📋 QR parseado:', qr);
      
      if (qr) {
        console.log('✅ QR válido, procesando datos de recuperación...');
        this.scannDataForm = true;
        console.log('✅ Escaneo completado exitosamente en destination-selection');
      } else {
        console.log('❌ QR inválido o sin datos');
        this.alertService.presentActionAlert('¡Ups! Parece que ocurrió un problema con el QR', 'Por favor, escanea un código QR valido para continuar.', () => {
          this.navCtrl.navigateForward('home');
        });
      }
    } catch (error) {
      console.error('💥 Error en readQR destination-selection:', error);
      
      // Manejar errores específicos
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('camera')) {
        this.alertService.presentBasicAlert(
          'Error de cámara',
          'No se pudo acceder a la cámara. Por favor, verifica los permisos en la configuración del dispositivo.'
        );
      } else if (errorMessage.includes('permission')) {
        this.alertService.presentBasicAlert(
          'Permisos denegados',
          'La aplicación no tiene permisos para usar la cámara. Por favor, habilita los permisos en la configuración.'
        );
      } else {
        this.alertService.presentBasicAlert(
          'Error de escaneo',
          'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente.'
        );
      }
      
      this.navCtrl.navigateForward('home');
    }
  }

  private async unsupportedBarcodeMessage() {
    this.alertService.presentBasicAlert('¡Ups!',
      'Parece que tu dispositivo no puede escanear códigos' +
      ' con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.',
    );
  }


  async goToNextPage() {
    // Fecha de orden de salida (punto 9) - se guarda en patientsExit.recover.checkDate
    this.patientExit.destination = this.model.destino;
    this.patientExit.state = StatusService.SELECCION_DESTINO;
    this.patientExit.recover = this.mapViewToModel();
    
    await this.loadingService.showLoadingBasic("Cargando...");

    this.medicalService.getInProgressMedicalAtenttion().then(sm => {
      sm.patientsExit = this.patientExit;
      sm.state = this.destinationStatus();
      this.updateMedicalService(sm, this.loadingService);

    }).catch(e => {
      this.loadingService.dismiss();
      console.log('Error consultando la atencion médica', e);
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
    this.markDepartureOrderDate();
    // Fecha de orden de salida (punto 9)
    recover.checkDate = this.model.fechaOrdenDeSalida;
    recover.simpleCheckDateOrder = this.datepipe.transform(recover.checkDate, 'yyyy-MM-dd')!;
    recover.simpleCheckHourOrder = this.datepipe.transform(recover.checkDate, 'HH:mm:ss')!;
    return recover;
  }

  private numericValue(valor: any): number | null {
    if (valor === '' || valor === null || valor === undefined) {
      return null;
    }
    // Si el valor es '-1' (No aplica), retornamos null
    if (valor === '-1') {
      return null;
    }
    return Number(valor);
  }

  private redirectToSelectedPage(): void {
    if (this.model.destino === 'CASA') {
      this.navCtrl.navigateForward('/home-destination');
    } else if (this.model.destino === 'HOSPITALIZACION') {
      this.navCtrl.navigateForward('/hospitalization-destination');
    } else if (this.model.destino === 'UCI') {
      this.navCtrl.navigateForward('/uci-destination');
    } else if (this.model.destino === 'SALA_DE_PAZ') {
      this.navCtrl.navigateForward('/decease-destination');
    } else if (this.model.destino === 'CIRUGIA') {
      this.navCtrl.navigateForward('/surgery-destination');
    }
  }

  private destinationStatus(): string {
    if (this.model.destino === 'CASA') {
      return StatusService.DESTINO_CASA;
    } else if (this.model.destino === 'HOSPITALIZACION') {
      return StatusService.DESTINO_HOSPITALIZACION;
    } else if (this.model.destino === 'UCI') {
      return StatusService.DESTINO_UCI;
    } else if (this.model.destino === 'SALA_DE_PAZ') {
      return StatusService.DESTINO_SALA_DE_PAZ;
    } else if (this.model.destino === 'CIRUGIA') {
      return StatusService.DESTINO_CIRUGIA;
    }
    return '';
  }

  private updateMedicalService(sm: MedicalAttention, loading: any) {
    this.medicalService.saveMedicalAttention(sm, 'sync')
      .then(result => {
        loading.dismiss();
        if (result) {

          this.redirectToSelectedPage();

        }
      }).catch(err => {
        loading.dismiss();
        console.error('No se pudo guardar el servicio médico', err);
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
