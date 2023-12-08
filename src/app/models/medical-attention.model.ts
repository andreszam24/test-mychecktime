import { Patient } from './patient.model';
import { Specialty } from './specialty.model';
import { CupsCodes } from './cups-codes.model';
import { OperationRoom } from './operationRoom.model';
import { MedicalEvent } from './medical-event.model';
import { ExitOperatingRoomList } from './exit-operating-room-list.model';
import { PatientsExitList } from './patients-exit-list.model';
import { OperatingRoomList } from './operating-room-list.model';
import { AdmissionList } from './admission-list.model';
import { AnesthesiologistProfile } from './anesthesiologist-profile.model';


import { Surgeon } from './surgeon.model';
import { Instrumentation } from './instrumentation.model';

export class MedicalAttention {

  _id: string;

  

  // Información básica
  idPatient: number;
  idClinica: number;
  idOperatingRoom: number;
  currentAnesthesiologist : AnesthesiologistProfile;

  // Encabezado
  patient: Patient;


  specialty: Specialty;
  numeroResgistro: string;
  programming: string;
  asa: string;
  procedureCodes: CupsCodes[] = [];
  operatingRoom: OperationRoom;
  state: string;
  
  originDate: Date;
  simpleOriginDate: String;
  simpleOriginHour: String;

  
  anestehsiologist: Array<AnesthesiologistProfile>;
  
  instrumentator: Instrumentation;
  surgeon: Surgeon;
  
  // Lista de ingreso
  admissionList: AdmissionList;

  // Lista de quirófano
  operatingRoomList: OperatingRoomList;

  // Salida sala de operación
  exitOperatingRoomList: ExitOperatingRoomList;

  // Lista de salida
  patientsExit: PatientsExitList;


  // eventos
  events: Array<MedicalEvent>


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
