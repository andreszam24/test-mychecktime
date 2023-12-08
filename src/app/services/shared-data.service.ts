import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class SharedDataService {

  private datos: any;

  setDatos(value: any) {
    this.datos = value;
  }

  getDatos() {
    return this.datos;
  }

}
