import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  static readonly INICIO: string = 'nueva';//morado
  static readonly ADMISSION_LIST: string = 'AdmissionList';//naranja
  static readonly SELECT_OPERATING_ROOM: string = 'SelectOperatingRoom';//naranja
  static readonly OPERATING_ROOM_LIST: string = 'OperatingRoomList';//rojo
  static readonly START_ANESTHESIA: string = 'StartAnesthesia';
  static readonly END_START_ANESTHESIA: string = 'EndStartAnesthesia';
  static readonly START_SURGERY: string = 'StartSurgery';
  static readonly END_SUGERY: string = 'EndSurgery';//rojo
  static readonly EXIT_OPERATING_ROOM_LIST: string = 'ExitOperatingRoomList';//rojo
  static readonly FROM_OPERATING_ROOM_TO: string = 'FromOperatingRoomTo';//amarillo
  static readonly SELECCION_DESTINO: string = 'SeleccionDestino';//azul
  static readonly DESTINO_CASA: string = 'DestinoCasa';
  static readonly DESTINO_HOSPITALIZACION: string = 'DestinoHospitalizacion';
  static readonly DESTINO_UCI: string = 'DestinoUCI';
  static readonly DESTINO_SALA_DE_PAZ: string = 'DestinoSalaDePaz';
  static readonly DESTINO_CIRUGIA: string = 'DestinoCirugia';
  static readonly TERMINADO: string = 'terminado';
  static readonly CANCELADO: string = 'cancelado';

  static readonly PATIENTS_IN_PREANESTHESIA: Array<string> = [
    StatusService.ADMISSION_LIST,
    StatusService.SELECT_OPERATING_ROOM,
  ];

  static readonly PATIENT_IN_OPERETING_ROOM = [
      StatusService.OPERATING_ROOM_LIST,
      StatusService.START_ANESTHESIA,
      StatusService.END_START_ANESTHESIA,
      StatusService.START_SURGERY,
      StatusService.END_SUGERY,
      StatusService.EXIT_OPERATING_ROOM_LIST
  ];

  static readonly PATIENTS_WITH_DISCHARGE_ORDER = [
    StatusService.SELECCION_DESTINO,
    StatusService.DESTINO_CASA,
    StatusService.DESTINO_CIRUGIA,
    StatusService.DESTINO_HOSPITALIZACION,
    StatusService.DESTINO_SALA_DE_PAZ,
    StatusService.DESTINO_UCI

  ]


  constructor() { }



  
}
