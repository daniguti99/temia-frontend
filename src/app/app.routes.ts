import { Routes } from '@angular/router';

import { publicoGuard } from './core/auth/publico.guard';
import { sesionGuard } from './core/auth/sesion.guard';

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
  {
    path: 'apuntes',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./components/shared/pagina-pendiente/pagina-pendiente').then(
        (m) => m.PaginaPendiente,
      ),
    data: {
      titulo: 'Apuntes',
      descripcion: 'Aquí subirás tus temarios y consultarás el material que hayas guardado.',
    },
  },
  {
    path: 'resumenes',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./components/shared/pagina-pendiente/pagina-pendiente').then(
        (m) => m.PaginaPendiente,
      ),
    data: {
      titulo: 'Resúmenes',
      descripcion: 'Aquí encontrarás los resúmenes generados a partir de tus apuntes.',
    },
  },
  {
    path: 'tests',
    canActivate: [sesionGuard],
    loadComponent: () =>
      import('./components/shared/pagina-pendiente/pagina-pendiente').then(
        (m) => m.PaginaPendiente,
      ),
    data: {
      titulo: 'Tests',
      descripcion: 'Aquí practicarás con exámenes tipo test corregidos al instante.',
    },
  },
  {
    path: 'perfil',
    canActivate: [sesionGuard],
    loadComponent: () => import('./pages/perfil/perfil').then((m) => m.Perfil),
  },
  {
    path: 'legal',
    loadComponent: () => import('./pages/legal/legal').then((m) => m.Legal),
  },
  { path: '**', redirectTo: '' },
];
