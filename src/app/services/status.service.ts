import { Injectable } from '@angular/core';
import { HomePage } from '../pages/home/home.page';
import { ListaIngresoPage } from '../pages/lista-ingreso/lista-ingreso';
import { ListaQuirofanoPage } from '../pages/lista-quirofano/lista-quirofano';
import { AnestesiaQuirofanoPage } from '../pages/anestesia-quirofano/anestesia-quirofano';
import { CkeckeoSalidaQuirofanoPage } from '../pages/checkeo-salida-quirofano/checkeo-salida-quirofano';
import { SalidaQuirofanoPage } from '../pages/menu-salida/salida-quirofano';
import { SeleccionDestinoPage } from '../pages/seleccion-destino/seleccion-destino';
import { DestinoCasaPage } from '../pages/destino-casa/destino-casa';
import { DestinoHospitalizacionPage } from '../pages/destino-hospitalizacion/destino-hospitalizacion';
import { DestinoUCIPage } from '../pages/destino-uci/destino-uci';
import { DestinoFallecimientoPage } from '../pages/destino-fallecimiento/destino-fallecimiento';
import { DestinoCirugiaPage } from '../pages/destino-cirugia/destino-cirugia';

export class Estado {
  name: string;
  index: number;
  page: any;

  public static create(index: number, name: string, page: any): Estado {
    const instance = new Estado();
    instance.index = index;
    instance.name = name;
    instance.page = page;
    return instance;
  }
}

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

  static readonly ESTADOS: Array<Estado> = [
    Estado.create(0, StatusService.INICIO, HomePage),
    Estado.create(1, StatusService.ADMISSION_LIST, ListaIngresoPage),
//TODO: borrar    Estado.create(2, StatusService.SELECT_OPERATING_ROOM, SeleccionarQuirofanoPage),
    Estado.create(3, StatusService.OPERATING_ROOM_LIST, ListaQuirofanoPage),
    Estado.create(4, StatusService.START_ANESTHESIA, AnestesiaQuirofanoPage),
    Estado.create(5, StatusService.END_START_ANESTHESIA, AnestesiaQuirofanoPage),
    Estado.create(6, StatusService.START_SURGERY, AnestesiaQuirofanoPage),
    Estado.create(7, StatusService.END_SUGERY, AnestesiaQuirofanoPage),
    Estado.create(8, StatusService.EXIT_OPERATING_ROOM_LIST, CkeckeoSalidaQuirofanoPage),
    Estado.create(9, StatusService.FROM_OPERATING_ROOM_TO, SalidaQuirofanoPage),
    Estado.create(10, StatusService.SELECCION_DESTINO, SeleccionDestinoPage),
    Estado.create(11, StatusService.TERMINADO, HomePage),
    Estado.create(12, StatusService.CANCELADO, HomePage)
  ];

  static readonly ORDEN_ESTADOS: Array<Estado> = [
    Estado.create(0, StatusService.INICIO, HomePage),
    Estado.create(1, StatusService.ADMISSION_LIST, ListaIngresoPage),
    Estado.create(2, StatusService.OPERATING_ROOM_LIST, ListaQuirofanoPage),
    Estado.create(3, StatusService.START_ANESTHESIA, AnestesiaQuirofanoPage),
    Estado.create(4, StatusService.END_START_ANESTHESIA, AnestesiaQuirofanoPage),
    Estado.create(5, StatusService.START_SURGERY, AnestesiaQuirofanoPage),
    Estado.create(6, StatusService.END_SUGERY, AnestesiaQuirofanoPage),
    Estado.create(7, StatusService.EXIT_OPERATING_ROOM_LIST, CkeckeoSalidaQuirofanoPage),
    Estado.create(8, StatusService.FROM_OPERATING_ROOM_TO, SalidaQuirofanoPage),
    Estado.create(9, StatusService.SELECCION_DESTINO, SeleccionDestinoPage),
    Estado.create(10, StatusService.DESTINO_CASA, DestinoCasaPage),
    Estado.create(10, StatusService.DESTINO_HOSPITALIZACION, DestinoHospitalizacionPage),
    Estado.create(10, StatusService.DESTINO_UCI, DestinoUCIPage),
    Estado.create(10, StatusService.DESTINO_SALA_DE_PAZ, DestinoFallecimientoPage),
    Estado.create(10, StatusService.DESTINO_CIRUGIA, DestinoCirugiaPage),
    Estado.create(11, StatusService.TERMINADO, HomePage),
    Estado.create(11, StatusService.CANCELADO, HomePage)
  ];

  constructor() { }

  public static isAtLeast(status: string, current: string): boolean {
    if (!(!!current)) {
      return false;
    }

    const currentStatusItem = StatusService.ESTADOS.find(e => e.name === current);
    const queryStatusItem = StatusService.ESTADOS.find(e => e.name === status);

    const currentIndex = currentStatusItem?.index || -1;
    const queryIndex = queryStatusItem?.index || -1;

    return currentIndex >= queryIndex;
  }

  public static isAfter(status: string, current: string): boolean {
    if (!(!!current)) {
      return false;
    }

    const currentStatusItem = StatusService.ORDEN_ESTADOS.find(e => e.name === current);
    const queryStatusItem = StatusService.ORDEN_ESTADOS.find(e => e.name === status);

    const currentIndex = currentStatusItem?.index || -1;
    const queryIndex = queryStatusItem?.index || -1;

    return currentIndex < queryIndex;
  }

}
