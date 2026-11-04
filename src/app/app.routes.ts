import { Routes } from '@angular/router';

import { publicoGuard } from './core/auth/publico.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/entrada/entrada').then((m) => m.Entrada),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth-routes').then((m) => m.AUTH_ROUTES),
    canActivate: [publicoGuard],
  },
  { path: '**', redirectTo: '' },
];
