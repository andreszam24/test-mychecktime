import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InternetServiceService {
  private internetStatusSubject = new Subject<boolean>();
  internetStatus$ = this.internetStatusSubject.asObservable();

  constructor() { }

  updateInternetStatus(isConnected: boolean) {
    this.internetStatusSubject.next(isConnected);
  }
}
