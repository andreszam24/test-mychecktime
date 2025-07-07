import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { EventsPanelComponent } from 'src/app/components/events-panel/events-panel.component';
import { StatusService } from 'src/app/services/status.service';
import { InProgressMedicalAttentionService } from 'src/app/services/in-progress-medical-attention.service';
import { MenuController } from '@ionic/angular';
import { MedicalAttention } from 'src/app/models/medical-attention.model';

@Component({
  selector: 'app-anesthesia-operating-room',
  templateUrl: './anesthesia-operating-room.page.html',
  styleUrls: ['./anesthesia-operating-room.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HeaderComponent, EventsPanelComponent]
})
export class AnesthesiaOperatingRoomPage implements OnInit, OnDestroy {

  eventoCancelarVisible: boolean = false;
  currentServiceStatus: string;
  anesthesiaTypes: Array<string>;
  isTimerRunning: boolean = false;
  timerInterval: any;
  elapsedTime: string = '00:00:00';
  startTime: Date | null = null;
  isTimerFinished: boolean = false;

  datepipe = new DatePipe('en-US');
  constructor(
    private navCtrl: NavController,
    private menu: MenuController,
    private medicalService: InProgressMedicalAttentionService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.validarSiEventoCancelarVisible();
    this.showExistingTimerData();
    this.executeAutoAnesthesiaFlow();
  }

  private validarSiEventoCancelarVisible() {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      this.currentServiceStatus = sm.state;console.log('estado actual: ',sm.state)
      console.log(StatusService.isAtLeast('StartAnesthesia', sm.state))
      if(StatusService.isAtLeast('StartAnesthesia', sm.state)) {
        this.eventoCancelarVisible = true;
        this.menu.enable(true, 'menu-anestesia');
      } 
    }).catch(e => Promise.reject(e));
  }

  private executeAutoAnesthesiaFlow() {
    console.log('🔄 Iniciando flujo automático de anestesia...');
    
    this.medicalService.getInProgressMedicalAtenttion().then(sm => {
      if (sm && sm.operatingRoomList) {
        const hasStartAnesthesia = !!sm.operatingRoomList.startAnesthesia;
        const hasEndAnesthesia = !!sm.operatingRoomList.endStartAnesthesia;
        
        console.log('📊 Estado actual de anestesia:');
        console.log('🟢 Inicio anestesia registrado:', hasStartAnesthesia);
        console.log('🔴 Fin anestesia registrado:', hasEndAnesthesia);
        
        // Si no hay inicio, registrarlo y luego programar el fin
        if (!hasStartAnesthesia) {
          console.log('⏰ Registrando inicio de anestesia automáticamente...');
          setTimeout(() => {
            this.executeStartAnesthesia();
          }, 100);
        } else {
          console.log('✅ Inicio de anestesia ya registrado');
          // Si ya hay inicio pero no hay fin, programar el fin
          if (!hasEndAnesthesia) {
            console.log('⏰ Programando fin de anestesia automático en 1 segundo...');
            setTimeout(() => {
              this.executeEndAnesthesia();
            }, 1000);
          }
        }
        
        // Si hay inicio pero no hay fin, programar el fin
        if (hasStartAnesthesia && !hasEndAnesthesia) {
          console.log('⏰ Programando fin de anestesia automático en 1 segundo...');
          setTimeout(() => {
            this.executeEndAnesthesia();
          }, 1000);
        } else if (hasEndAnesthesia) {
          console.log('✅ Fin de anestesia ya registrado');
        }
      }
    }).catch(e => {
      console.log('❌ Error en flujo automático de anestesia:', e);
    });
  }

  private executeStartAnesthesia() {
    console.log('🚀 Ejecutando inicio automático de anestesia...');
    this.habilitarMenu();
    this.inhabilitarOpcionEventoCancelar();

    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.startAnesthesia = new Date();
      sm.operatingRoomList.simpleStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'HH:mm:ss')!;

      sm.operatingRoomList.status = StatusService.START_ANESTHESIA;
      sm.state = StatusService.START_ANESTHESIA;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - INICIO ANESTESIA (AUTOMÁTICO):');
      console.log('📅 Fecha inicio:', sm.operatingRoomList.simpleStartAnesthesiaDate);
      console.log('⏰ Hora inicio:', sm.operatingRoomList.simpleStartAnesthesiaHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    this.checkItemAndSave(check, () => {
      console.log('✅ Inicio de anestesia automático completado');
      // Después de completar el inicio, programar el fin en 1 segundo
      setTimeout(() => {
        this.executeEndAnesthesia();
      }, 1000);
    });
  }

  private executeEndAnesthesia() {
    console.log('🏁 Ejecutando fin automático de anestesia...');
    this.inhabilitarOpcionEventoCancelar();
    
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.endStartAnesthesia = new Date();
      sm.operatingRoomList.simpleEndStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleEndStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'HH:mm:ss')!;
      
      sm.operatingRoomList.status = StatusService.END_START_ANESTHESIA;
      sm.state = StatusService.END_START_ANESTHESIA;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - FIN ANESTESIA (AUTOMÁTICO):');
      console.log('📅 Fecha fin:', sm.operatingRoomList.simpleEndStartAnesthesiaDate);
      console.log('⏰ Hora fin:', sm.operatingRoomList.simpleEndStartAnesthesiaHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    this.checkItemAndSave(check, () => {
      console.log('✅ Fin de anestesia automático completado');
      this.cdr.detectChanges();
    });
  }

  goToInicoAnestesia() {
    this.habilitarMenu();
    this.inhabilitarOpcionEventoCancelar();

    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.startAnesthesia = new Date();
      sm.operatingRoomList.simpleStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.startAnesthesia,'HH:mm:ss')!;

      sm.operatingRoomList.status = StatusService.START_ANESTHESIA;
      sm.state = StatusService.START_ANESTHESIA;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - INICIO ANESTESIA:');
      console.log('📅 Fecha inicio:', sm.operatingRoomList.simpleStartAnesthesiaDate);
      console.log('⏰ Hora inicio:', sm.operatingRoomList.simpleStartAnesthesiaHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    this.checkItemAndSave(check, () => {});
  }

  private habilitarMenu() {
    this.menu.enable(true, 'menu-anestesia');
    this.menu.open('menu-anestesia');
  }

  private inhabilitarOpcionEventoCancelar() {
    this.eventoCancelarVisible = false;
  }

  goToFinInicioAnestesia() {
    this.inhabilitarOpcionEventoCancelar();
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.endStartAnesthesia = new Date();
      sm.operatingRoomList.simpleEndStartAnesthesiaDate = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleEndStartAnesthesiaHour = this.datepipe.transform(sm.operatingRoomList.endStartAnesthesia,'HH:mm:ss')!;
      
      sm.operatingRoomList.status = StatusService.END_START_ANESTHESIA;
      sm.state = StatusService.END_START_ANESTHESIA;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - FIN ANESTESIA:');
      console.log('📅 Fecha fin:', sm.operatingRoomList.simpleEndStartAnesthesiaDate);
      console.log('⏰ Hora fin:', sm.operatingRoomList.simpleEndStartAnesthesiaHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    this.checkItemAndSave(check, () => {this.cdr.detectChanges()});
  }

  goToIncisionQuirurgica() {
    this.inhabilitarOpcionEventoCancelar();
    this.startTimer();
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.startSurgery = new Date();
      sm.operatingRoomList.simpleStartSurgeryDate = this.datepipe.transform(sm.operatingRoomList.startSurgery,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleStartSurgeryHour = this.datepipe.transform(sm.operatingRoomList.startSurgery,'HH:mm:ss')!;
      
      sm.operatingRoomList.status = StatusService.START_SURGERY;
      sm.state = StatusService.START_SURGERY;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - INICIO CIRUGÍA:');
      console.log('📅 Fecha inicio cirugía:', sm.operatingRoomList.simpleStartSurgeryDate);
      console.log('⏰ Hora inicio cirugía:', sm.operatingRoomList.simpleStartSurgeryHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    this.checkItemAndSave(check, () => {this.cdr.detectChanges();});
  }

  goToFinCirugia() {
    this.inhabilitarOpcionEventoCancelar();
    this.stopTimer();
    const check = (sm: MedicalAttention) => {
      sm.operatingRoomList.endSurgery = new Date();
      sm.operatingRoomList.simpleEndSurgeryDate = this.datepipe.transform(sm.operatingRoomList.endSurgery,'yyyy-MM-dd')!;
      sm.operatingRoomList.simpleEndSurgeryHour = this.datepipe.transform(sm.operatingRoomList.endSurgery,'HH:mm:ss')!;

      sm.operatingRoomList.status = StatusService.TERMINADO;
      sm.state = StatusService.END_SUGERY;
      
      // Log de datos guardados
      console.log('🕐 DATOS GUARDADOS - FIN CIRUGÍA:');
      console.log('📅 Fecha fin cirugía:', sm.operatingRoomList.simpleEndSurgeryDate);
      console.log('⏰ Hora fin cirugía:', sm.operatingRoomList.simpleEndSurgeryHour);
      console.log('📊 Estado:', sm.operatingRoomList.status);
      console.log('🆔 Estado general:', sm.state);
      console.log('⏱️ Tiempo transcurrido:', this.elapsedTime);
      console.log('📋 Datos completos operatingRoomList:', sm.operatingRoomList);
    }

    const success = () => this.navCtrl.navigateForward('/operating-room-exit-check');

    this.checkItemAndSave(check, success);
  }

  private checkItemAndSave( checkFn: ( s :MedicalAttention) => void , success: () => void): void {
    this.medicalService.getInProgressMedicalAtenttion().then( sm => {
      
      if(!(!!sm.operatingRoomList)) {
        this.navCtrl.pop();
        return;
      }

      checkFn(sm);

      this.medicalService.saveMedicalAttention(sm,'nosync')
        .then(result => {
            if(result) {
              this.currentServiceStatus = sm.state;
              success();
            }
          }).catch(() => console.error('No se pudo guardar el servicio médico'));
    }).catch(() => console.log('Error consultando la atencion medica'));
  }

  color(searchedStatus: string): string {
    if(StatusService.nextStatus(this.currentServiceStatus) === searchedStatus) {
      return 'var(--ion-color-app-yellow)';
    } else if(StatusService.isAtLeast(searchedStatus, this.currentServiceStatus)) {
      return 'var(--ion-color-app-blue)';
    } else {
      return 'var(--ion-color-app-gray)';
    }
  }

  disabled(searchedStatus: string): boolean {
    return StatusService.nextStatus(this.currentServiceStatus) !== searchedStatus;
  }

  private startTimer() {
    // Si ya hay un timer corriendo, no crear otro
    if (this.timerInterval) {
      return;
    }
    
    // Si no hay startTime, crear uno nuevo
    if (!this.startTime) {
      this.startTime = new Date();
    }
    
    this.isTimerRunning = true;
    
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  }

  private stopTimer() {
    this.isTimerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimer() {
    if (this.startTime) {
      const now = new Date();
      const diff = now.getTime() - this.startTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      this.elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  showTimerData() {
    console.log('Timer Data:', this.elapsedTime);
  }

  showExistingTimerData() {
    this.medicalService.getInProgressMedicalAtenttion().then(sm => {
      if (sm && sm.operatingRoomList) {
        if (sm.operatingRoomList.startSurgery) {
          if (!sm.operatingRoomList.endSurgery) {
            this.startTimerFromExistingData(sm.operatingRoomList.startSurgery);
          } else {
            this.showFinalSurgeryTime(sm.operatingRoomList.startSurgery, sm.operatingRoomList.endSurgery);
          }
        }
        
        // Mostrar datos de fin de cirugía
        if (sm.operatingRoomList.endSurgery) {
          console.log('⚫ FIN CIRUGÍA:');
          console.log('📅 Fecha:', sm.operatingRoomList.simpleEndSurgeryDate);
          console.log('⏰ Hora:', sm.operatingRoomList.simpleEndSurgeryHour);
        }
        
        // Mostrar datos de inicio de anestesia (solo para referencia)
        if (sm.operatingRoomList.startAnesthesia) {
          console.log('🟢 INICIO ANESTESIA:');
          console.log('📅 Fecha:', sm.operatingRoomList.simpleStartAnesthesiaDate);
          console.log('⏰ Hora:', sm.operatingRoomList.simpleStartAnesthesiaHour);
        }
        
        // Mostrar datos de fin de anestesia (solo para referencia)
        if (sm.operatingRoomList.endStartAnesthesia) {
          console.log('🔴 FIN ANESTESIA:');
          console.log('📅 Fecha:', sm.operatingRoomList.simpleEndStartAnesthesiaDate);
          console.log('⏰ Hora:', sm.operatingRoomList.simpleEndStartAnesthesiaHour);
        }
        
        // Mostrar estado actual
        console.log('🆔 ESTADO ACTUAL:', sm.state);
        console.log('📊 ESTADO OPERATING ROOM:', sm.operatingRoomList.status);
        
      } else {
        console.log('❌ No hay datos de operatingRoomList disponibles');
      }
    }).catch(e => {
      console.log('❌ Error obteniendo datos del timer:', e);
    });
  }

  private startTimerFromExistingData(startTime: any) {
    // Convertir el string a Date si es necesario
    if (typeof startTime === 'string') {
      this.startTime = new Date(startTime);
    } else {
      this.startTime = startTime;
    }
    
    this.isTimerRunning = true;
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
    
    console.log('⏱️ Timer iniciado desde:', this.startTime);
  }

  private showFinalAnesthesiaTime(startTime: any, endTime: any) {
    // Convertir strings a Date si es necesario
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    this.elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.isTimerRunning = true; // Para mostrar el timer
    this.isTimerFinished = true; // Marcar como finalizado
    this.cdr.detectChanges();
    
    console.log('⏱️ Tiempo final de anestesia:', this.elapsedTime);
    console.log('📅 Desde:', start);
    console.log('📅 Hasta:', end);
  }

  private showFinalSurgeryTime(startTime: any, endTime: any) {
    // Convertir strings a Date si es necesario
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
    
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    this.elapsedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    this.isTimerRunning = true; // Para mostrar el timer
    this.isTimerFinished = true; // Marcar como finalizado
    this.cdr.detectChanges();
    
    console.log('⏱️ Tiempo final de cirugía:', this.elapsedTime);
    console.log('📅 Desde:', start);
    console.log('📅 Hasta:', end);
  }

}
