import { HttpInterceptorFn } from '@angular/common/http';

const RUTAS_PUBLICAS = ['/api/auth/login', '/api/auth/register'];

/**
 * Añade `Authorization: Bearer <token>` a todas las peticiones menos a login y
 * registro. Lee el token de `localStorage` para no depender de `AuthService`
 * (que a su vez depende de `HttpClient`).
 */
export const authInterceptor: HttpInterceptorFn = (peticion, siguiente) => {
  const esPublica = RUTAS_PUBLICAS.some((ruta) => peticion.url.includes(ruta));
  const token = localStorage.getItem('temia_token');

  if (esPublica || !token) {
    return siguiente(peticion);
  }

  return siguiente(
    peticion.clone({ setHeaders: { Authorization: `Bearer ${token}` } }),
  );
};
