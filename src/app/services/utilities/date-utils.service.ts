import { Injectable } from '@angular/core';


@Injectable()
export class DateUtilsService {

    static stringHour2Date(hour: string): Date {
        if (!hour) {
            return new Date("1/1/1");
        }

        const tokens = hour.split(':').map(t => parseInt(t));
        const now = new Date();
        now.setHours(tokens[0]);
        now.setMinutes(tokens[1]);
        // const myDateLocal: string = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();
        
        return now;
    }

    static stringDate2Date(stringDate: string): Date {
        if (!stringDate) {
            return new Date("1/1/1");
        }
        return new Date(stringDate);
    }

    /* Para validación de hora máxima seleccionable en ion-datetime */
    static iso8601DateTime(date: Date): string {
        const completeStringDate = date.toISOString();
        const timeIndex = completeStringDate.indexOf('T');
        return completeStringDate.substr(0, timeIndex + 6);
    }

    static toColombianOffset(date: Date): Date {
        if (!date) {
            return new Date("1/1/1");
        }

        date.setHours(date.getHours() - 5);
        return date;
    }

    static toUTC(date: Date): Date {
        if (!date) {
            return new Date("1/1/1");
        }

        date.setHours(date.getHours() + 5);
        return date;
    }
}
