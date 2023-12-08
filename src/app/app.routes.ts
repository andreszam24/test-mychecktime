import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'patient-intake',
    loadComponent: () => import('./pages/patient-intake/patient-intake.page').then( m => m.PatientIntakePage)
  },
  {
    path: 'patient-summary',
    loadComponent: () => import('./pages/patient-summary/patient-summary.page').then( m => m.PatientSummaryPage)
  },

];
