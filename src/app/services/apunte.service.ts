import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';

import { API_URL } from '../api/api.config';
import { ApiResponse } from '../core/models/auth';
import {
  ActualizarApunte,
  ApunteDetalle,
  ApunteListado,
  NuevoApunteTexto,
} from '../core/models/apunte';

/**
 * Llamadas a los endpoints de apuntes.
 *
 * El listado se guarda en un signal para que las páginas lo lean sin repetir la
 * petición. Las escrituras devuelven el `Observable` y no tocan el signal: el
 * componente navega, avisa y vuelve a listar cuando hace falta.
 */
@Injectable({ providedIn: 'root' })
export class ApunteService {
  private readonly URL_APUNTES = `${API_URL}/apuntes`;
  private readonly http = inject(HttpClient);

  private _apuntes = signal<ApunteListado[]>([]);
  apuntes = this._apuntes.asReadonly();

  /** Recupera los apuntes del usuario y actualiza el signal del listado. */
  listar(): Observable<ApunteListado[]> {
    return this.http.get<ApiResponse<ApunteListado[]>>(this.URL_APUNTES).pipe(
      map((respuesta) => respuesta.data),
      tap((apuntes) => this._apuntes.set(apuntes)),
    );
  }

  /** Devuelve el detalle de un apunte propio. */
  obtener(id: number): Observable<ApunteDetalle> {
    return this.http
      .get<ApiResponse<ApunteDetalle>>(`${this.URL_APUNTES}/${id}`)
      .pipe(map((respuesta) => respuesta.data));
  }

  /** Crea un apunte de texto. */
  crear(peticion: NuevoApunteTexto): Observable<ApunteDetalle> {
    return this.http
      .post<ApiResponse<ApunteDetalle>>(this.URL_APUNTES, peticion)
      .pipe(map((respuesta) => respuesta.data));
  }

  /** Actualiza solo los campos enviados. */
  actualizar(id: number, peticion: ActualizarApunte): Observable<ApunteDetalle> {
    return this.http
      .patch<ApiResponse<ApunteDetalle>>(`${this.URL_APUNTES}/${id}`, peticion)
      .pipe(map((respuesta) => respuesta.data));
  }

  /** Elimina un apunte propio. */
  eliminar(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<null>>(`${this.URL_APUNTES}/${id}`)
      .pipe(map(() => undefined));
  }
}
