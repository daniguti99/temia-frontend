import { Routes } from '@angular/router';

export const APUNTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./apuntes').then((m) => m.Apuntes),
  },
  {
    path: 'nuevo',
    loadComponent: () => import('./nuevo/nuevo').then((m) => m.NuevoApunte),
  },
  {
    path: ':id',
    loadComponent: () => import('./detalle/detalle').then((m) => m.DetalleApunte),
  },
];
