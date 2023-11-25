import { Patient } from './patient.model';
import { Specialty } from './specialty.model';
import { CupsCodes } from './cups-codes.model';
import { OperationRoom } from './operationRoom.model';
/*import { MedicalEvent } from './medical-event.model';
import { OperationRoom } from './operationRoom.model';

import { ExitOperatingRoomList } from './exit-operating-room-list.model';
import { PatientsExitList } from './patients-exit-list.model';
import { OperatingRoomList } from './operating-room-list.model';
import { AdmissionList } from './admission-list.model';
import { AnesthesiologistProfile } from './anesthesiologist-profile.model';


import { Cirujano } from './cirujano.model';
import { Instrumentador } from './instrumentador.model';*/

export class MedicalAttention {

  /*_id: string;

  // Información básica
  idPatient: number;
  idClinica: number;
  idOperatingRoom: number;*/
  //currentAnesthesiologist : AnesthesiologistProfile;

  // Encabezado
  patient: Patient;


  specialty: Specialty;
  numeroResgistro: string;
  programming: string;
  asa: string;
  procedureCodes: CupsCodes[] = [];
  operatingRoom: OperationRoom;
  state: string;
  
  /*originDate: Date;
  simpleOriginDate: String;
  simpleOriginHour: String;*/

  /*
  anestehsiologist: Array<AnesthesiologistProfile>;
  
  instrumentator: Instrumentador;
  surgeon: Cirujano;
  
  // Lista de ingreso
  admissionList: AdmissionList;

  // Lista de quirófano
  operatingRoomList: OperatingRoomList;

  // Salida sala de operación
  exitOperatingRoomList: ExitOperatingRoomList;

  // Lista de salida
  patientsExit: PatientsExitList;

  state: string;

  // eventos
  events: Array<MedicalEvent>

  // Volatil
  
  operatingRoom: OperationRoom;*/
  setPatient(value: Patient) {
    this.patient = value;
  }

  setSpecialty(value: Specialty) {
    this.specialty = value;
  }

  setProcedureCups(value: CupsCodes[]) {
    this.procedureCodes = value;
  }
}
