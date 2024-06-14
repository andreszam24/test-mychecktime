import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Network } from '@capacitor/network'; // Import Capacitor Network

@Injectable({
  providedIn: 'root'
})
export class InternetServiceService {
  private internetStatusSubject = new Subject<boolean>();
  internetStatus$ = this.internetStatusSubject.asObservable();

  constructor() {
    this.initializeNetworkStatus();
  }

  async initializeNetworkStatus() {
    // Check and emit the initial network status
    const status = await Network.getStatus();
    this.internetStatusSubject.next(status.connected);

    // Listen for network status changes and emit them
    Network.addListener('networkStatusChange', (status) => {
      this.internetStatusSubject.next(status.connected);
    });
  }
  
  updateInternetStatus(isConnected: boolean) {
    this.internetStatusSubject.next(isConnected);
  }
}




