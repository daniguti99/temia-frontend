import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Las pantallas de acceso no se muestran con la sesión abierta. */
export const publicoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.usuario() ? router.createUrlTree(['/']) : true;
};
