import { LocalPersistenceDataService } from './local-persistence-data.service';
import { Injectable } from '@angular/core';

import { OperationRoom } from './../models/operationRoom.model';
import { Clinic } from './../models/clinic.model';


@Injectable()
export class WorkingAreaService extends LocalPersistenceDataService {
  
  private clinicStorageKey = 'warea_clinic';
  private roomStorageKey = 'warea_room';

  constructor() {
    super();
  }

  getClinic(): Clinic {
    return this.getLocalData(this.clinicStorageKey);
  }

  getOperationRoom(): OperationRoom {
    return this.getLocalData(this.roomStorageKey);
  }

  setClinic(clinic: Clinic) {
    this.saveLocalData(this.clinicStorageKey, clinic);
  }

  setOperationRoom(room: OperationRoom) {
    this.saveLocalData(this.roomStorageKey, room);
  }
}
