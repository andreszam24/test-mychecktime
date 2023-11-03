import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'patient-intake',
    loadComponent: () => import('./pages/patient-intake/patient-intake.page').then( m => m.PatientIntakePage)
  },
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage)
  },


];
