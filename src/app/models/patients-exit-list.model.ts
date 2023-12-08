import { UCI } from './uci.model';
import { Recover } from './recover.model';

export class PatientsExitList {

    destination: string;
    description: string;
    recover: Recover; // fecha orden de salida
    uci: UCI;
    decease: Date;
    simpleDeceaseDate: string;
    simpleDeceaseHour: string;
    checkDate: Date;
    simpleCheckDate: string;
    simpleCheckHour: string;
    state: string;
}