import { Clinic } from "./clinic.model";

export class OperationRoom {
  id: number;
  name: string;
  status: string;
  clinic_id: number;
  updated_at: string;
  created_at: string;
  clinic : Clinic;
}