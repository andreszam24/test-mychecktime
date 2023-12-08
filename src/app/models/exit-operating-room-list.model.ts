import { FromOperatingRoomTo } from './from-operating-room-to.model';

export class ExitOperatingRoomList {

  confirmProcedure: boolean;
  instrumentsCount: boolean;
  verifyTagsPatient: boolean;
  problemsResolve: boolean;
  recoveryReview: boolean;
  checkDate: Date;
  simpleCheckDate: string;
  simpleCheckHour: string;
  bloodCount: string;
  bloodCountUnits: string;
  endProcedureDate: Date;
  simpleEndProcedureDate: string;
  simpleEndProcedureHour: string;
  status: string;
  fromOperatingRoomTo: FromOperatingRoomTo;

}
