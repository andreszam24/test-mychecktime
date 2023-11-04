
import { HttpHeaders } from '@angular/common/http';

export const app_version = '1.2.7';


const headers = new HttpHeaders({
    'Content-Type':  'application/json',
    'Authorization': 'Bearer',
    'Access-Control-Allow-Origin' : '*',
    'App-Version': app_version
});

export const httpOptions = {
  headers: headers
};

export const optionsCredentials = {
  headers: headers,
  withCredentials: true
};

const URLServer = 'https://mychecktime.com.co/main';



export const URLAuthLogin = `${URLServer}/login`;