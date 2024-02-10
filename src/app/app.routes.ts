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
  {
    path: 'pre-anesthesia',
    loadComponent: () => import('./pages/pre-anesthesia/pre-anesthesia.page').then( m => m.PreAnesthesiaPage)
  },
  {
    path: 'complications',
    loadComponent: () => import('./pages/complications/complications.page').then( m => m.ComplicationsPage)
  },
  {
    path: 'transfusion',
    loadComponent: () => import('./pages/transfusion/transfusion.page').then( m => m.TransfusionPage)
  },
  {
    path: 'adverse-event',
    loadComponent: () => import('./pages/adverse-event/adverse-event.page').then( m => m.AdverseEventPage)
  },
  {
    path: 'cancellation',
    loadComponent: () => import('./pages/cancellation/cancellation.page').then( m => m.CancellationPage)
  },
  {
    path: 'shift-handover',
    loadComponent: () => import('./pages/shift-handover/shift-handover.page').then( m => m.ShiftHandoverPage)
  },
  {
    path: 'select-operating-room',
    loadComponent: () => import('./pages/select-operating-room/select-operating-room.page').then( m => m.SelectOperatingRoomPage)
  },
  {
    path: 'check-patient-info',
    loadComponent: () => import('./pages/check-patient-info/check-patient-info.page').then( m => m.CheckPatientInfoPage)
  },
  {
    path: 'operating-room-list',
    loadComponent: () => import('./pages/operating-room-list/operating-room-list.page').then( m => m.OperatingRoomListPage)
  },
  {
    path: 'anesthesia-operating-room',
    loadComponent: () => import('./pages/anesthesia-operating-room/anesthesia-operating-room.page').then( m => m.AnesthesiaOperatingRoomPage)
  },



];
