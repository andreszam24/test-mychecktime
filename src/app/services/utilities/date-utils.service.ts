import { Injectable } from '@angular/core';


@Injectable()
export class DateUtilsService {

    static stringHour2Date(hour: string): Date {
        if (!hour) {
            return new Date("1/1/1");
        }

        console.log('hora: ',hour)

        // const tokens = hour.split(':').map(t => parseInt(t));
        // console.log('tokens', tokens);
        const now = new Date();
        // now.setHours(tokens[0]);
        // now.setMinutes(tokens[1]);
        // const myDateLocal: string = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString();
        console.log('nowwwwww---', now);
        
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
        console.log('date --> iso8601DateTime', date);
        const completeStringDate = date.toISOString();
        console.log('completeStringDate', completeStringDate);
        const timeIndex = completeStringDate.indexOf('T');
        console.log('timeIndex', timeIndex);
        console.log('completeStringDate.substr(0, timeIndex + 6)', completeStringDate.substr(0, timeIndex + 6));
        return completeStringDate.substr(0, timeIndex + 6);
    }

    static toColombianOffset(date: Date): Date {
        if (!date) {
            console.log('pasa por el if --> toColombianOffset');
            return new Date("1/1/1");
        }

        date.setHours(date.getHours() - 5);
        console.log('date', date);
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
