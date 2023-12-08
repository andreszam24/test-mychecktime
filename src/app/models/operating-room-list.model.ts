import { Recambio } from './recambio.model';

export class OperatingRoomList {

  confirmMembers: boolean;
  confirmIdentity: boolean;
  criticalEvents: boolean;
  anesthesiaTeamReview: boolean;
  nurseTeamReview: boolean;
  administeredProphylaxis: boolean;
  diagnosticImages: boolean;
  checkDate: Date;
  simpleCheckDate: String;
  simpleCheckHour: String;
  startAnesthesia: Date;
  simpleStartAnesthesiaDate: string;
  simpleStartAnesthesiaHour: String;
  endStartAnesthesia: Date;
  simpleEndStartAnesthesiaDate: String;
  simpleEndStartAnesthesiaHour: String;
  startSurgery: Date;
  simpleStartSurgeryDate: String;
  simpleStartSurgeryHour: String;
  endSurgery: Date;
  simpleEndSurgeryDate: String;
  simpleEndSurgeryHour: String;
  anesthesiaTypes: Array<string>;
  status: string;
  recambio: Recambio;
}
