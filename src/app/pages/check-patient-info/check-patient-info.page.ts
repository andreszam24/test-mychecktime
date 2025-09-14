import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Barcode, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { Patient } from 'src/app/models/patient.model';
import { ButtonPanelComponent } from 'src/app/components/button-panel/button-panel.component';
import { AuthService, USER_KEY } from 'src/app/services/auth.service';


@Component({
  selector: 'app-check-patient-info',
  templateUrl: './check-patient-info.page.html',
  styleUrls: ['./check-patient-info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, ButtonPanelComponent]
})
export class CheckPatientInfoPage implements OnInit {

  barcodes: Barcode[] = [];
  textItem: string = 'Si el paciente no tiene manilla, ingrese los últimos 4 dígitos de su identificación y oprima continuar.';
  isSupported = false;
  validPerson: Patient;
  inputData:string = '';
  medicalServiceInProgressDataPatient:Patient;
  dataUser: any;



  constructor(
    private navCtrl: NavController,
    private medicalService: InProgressMedicalAttentionService,
  ) {
    this.dataUser = localStorage.getItem(USER_KEY);
  }

  get idUser(): boolean {
    const userData = JSON.parse(this.dataUser);
    return userData.id === 870 || userData.id === 866;
  }

  ngOnInit() {
    this.medicalServiceInProgress();
    
    // Si es el usuario 870 o 866, llenar automáticamente el input con "1570"
    if (this.idUser) {
      this.inputData = '1570';
    }
    
    //this.startBarcodeScanner();
  }

  startBarcodeScanner() {
    BarcodeScanner.isSupported().then((result) => {
      this.isSupported = result.supported;
      this.scan();
    }).catch(async (error) => {
      console.error(error.message);
      await this.unsupportedBarcodeMessage();
    });
  }

  private async unsupportedBarcodeMessage() {
    this.textItem = '¡Ups! Parece que tu dispositivo no puede escanear códigos con la cámara en este momento. Lamentablemente, esta función no está disponible en tu dispositivo.';
  }

  async scan(): Promise<void> {
    console.log('📱 Iniciando proceso de escaneo en check-patient-info...');
    
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
        this.textItem = '¡Ups! Sin permisos ¡Activa los permisos de la cámara para usar el escáner de códigos o ingresa los ultimos 4 digitos de su identificacion  y oprime continuar';
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
            this.textItem = 'No se pudo inicializar el escáner. Por favor, intenta nuevamente o ingresa los últimos 4 dígitos de su identificación.';
          });
      }
    } catch (error) {
      console.error('💥 Error en scan check-patient-info:', error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage === 'scan canceled.') {
        this.textItem = '¡Ups! Parece que cancelaste el escaneo. Por favor, escanea el código QR para verificar identidad del paciente o ingresa los ultimos 4 digitos de su identificacion  y oprime continuar.';
      } else if (errorMessage.includes('device') || errorMessage.includes('camera')) {
        this.textItem = '¡Ups! Parece que hay un problema con tu dispositivo o cámara. Asegúrate de que estén funcionando correctamente y vuelve a intentarlo.';
      } else {
        console.error('Error inesperado:', errorMessage);
        this.textItem = 'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente o ingresa los últimos 4 dígitos de su identificación.';
      }
    }
  }

  private async readQR() {
    try {
      console.log('📷 Iniciando escaneo de QR en check-patient-info...');
      
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
        this.textItem = 'No se pudo detectar ningún código QR. Por favor, asegúrate de que el código esté bien visible y vuelve a intentar, o ingresa los últimos 4 dígitos de su identificación.';
        return;
      }
      
      const barcode = result.barcodes[0];
      console.log('🔍 Código detectado:', barcode);
      
      let qr = this.parseJSONMedicalAttentionSafely(barcode.displayValue);
      console.log('📋 QR parseado:', qr);
      
      if (qr && qr.patient) {
        console.log('✅ QR válido, procesando datos del paciente...');
        this.validPerson = qr.patient;
        this.verifyDataPatient();
      } else {
        console.log('❌ QR inválido o sin datos de paciente');
        this.textItem = '¡Ups! Parece que ocurrió un problema con el QR, ingresa los ultimos 4 digitos de su identificacion  y oprime continuar';
      }
    } catch (error) {
      console.error('💥 Error en readQR check-patient-info:', error);
      
      // Manejar errores específicos
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('camera')) {
        this.textItem = 'No se pudo acceder a la cámara. Por favor, verifica los permisos en la configuración del dispositivo o ingresa los últimos 4 dígitos de su identificación.';
      } else if (errorMessage.includes('permission')) {
        this.textItem = 'La aplicación no tiene permisos para usar la cámara. Por favor, habilita los permisos en la configuración o ingresa los últimos 4 dígitos de su identificación.';
      } else {
        this.textItem = 'Ocurrió un error inesperado durante el escaneo. Por favor, intenta nuevamente o ingresa los últimos 4 dígitos de su identificación.';
      }
    }
  }

  medicalServiceInProgress(){
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      this.medicalServiceInProgressDataPatient = sm.patient;
    }).catch(() => console.log('Error consultando la atencion médica'));
  }

  verifyDataPatient(){
    try {
      console.log('🔍 Verificando datos del paciente...');
      console.log('👤 Paciente del servicio médico:', this.medicalServiceInProgressDataPatient);
      console.log('👤 Paciente del QR:', this.validPerson);
      
      if(this.doesMatch()){
        console.log('✅ Los datos del paciente coinciden, continuando...');
        this.goToNextPage();
      } else {
        console.log('❌ Los datos del paciente no coinciden');
        this.textItem = '¡Ups! Parece que ocurrió un problema, el contenido del código QR no corresponde al paciente, verifica la identidad antes de continuar';
      }
    } catch (error) {
      console.error('💥 Error en verifyDataPatient:', error);
      this.textItem = 'Error verificando los datos del paciente. Por favor, intenta nuevamente o ingresa los últimos 4 dígitos de su identificación.';
    }
  }

  doesMatch(): boolean {
    if (this.medicalServiceInProgressDataPatient.dni === this.validPerson.dni && this.medicalServiceInProgressDataPatient.name === this.validPerson.name && this.medicalServiceInProgressDataPatient.lastname === this.validPerson.lastname) {
      return true;
  } else {
      return false;
  }}

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
  
  async requestPermissions(): Promise<boolean> {
    const { camera } = await BarcodeScanner.requestPermissions();
    return camera === 'granted' || camera === 'limited';
  }

  goToNextPage(){
    this.navCtrl.navigateForward('operating-room-list');
  }

  goBackRoom() {
    this.navCtrl.navigateForward('home');
  }

  toContinue() {
    if (this.inputData.trim() === '') {
      this.textItem = '¡Ups! Debe ingresar un valor manual o dar click en la imagen para escanear el codigo QR y validar identidad del paciente';
    } else {
      let patientDni = this.medicalServiceInProgressDataPatient.dni.slice(-4);
      console.log(patientDni)
      if(patientDni === this.inputData){
        this.goToNextPage();
      } else{
        this.textItem = 'los ultimos 4 digitos no coinciden con el paciente programado, debes validar identidad del paciente';
      }     
    }
  }

  validarInputData(): boolean {
    return /^[0-9]{4}$/.test(this.inputData);
  }


}
