import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, map, tap } from 'rxjs';

import { API_URL } from '../../api/api.config';
import { ApiResponse, AuthResponse, ActualizarPerfilRequest, LoginRequest, RegisterRequest, UserInfo } from '../models/auth';

const CLAVE_TOKEN = 'temia_token';
const CLAVE_USUARIO = 'temia_user';

/**
 * Sesión del usuario.
 *
 * Las lecturas dejan el resultado en un signal y las escrituras devuelven el
 * `Observable`: el componente decide la navegación y el aviso.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly URL_AUTH = `${API_URL}/auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private _usuario = signal<UserInfo | null>(null);
  usuario = this._usuario.asReadonly();

  /** Inicia sesión y guarda token y usuario. */
  login(peticion: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.URL_AUTH}/login`, peticion)
      .pipe(
        map((respuesta) => respuesta.data),
        tap((respuesta) => this.guardarSesion(respuesta)),
      );
  }

  /** Crea la cuenta y envía la foto opcional como parte `photo`. */
  registrar(datos: RegisterRequest, foto: File | null): Observable<AuthResponse> {
    const cuerpo = new FormData();
    cuerpo.append('data', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (foto) {
      cuerpo.append('photo', foto);
    }

    return this.http
      .post<ApiResponse<AuthResponse>>(`${this.URL_AUTH}/register`, cuerpo)
      .pipe(map((respuesta) => respuesta.data));
  }

  /**
   * Actualiza el nombre de usuario y, si se envía, la contraseña.
   * El backend devuelve el `UserInfo` actualizado y aquí se guarda en la sesión.
   */
  actualizarPerfil(peticion: ActualizarPerfilRequest): Observable<UserInfo> {
    return this.http.patch<ApiResponse<UserInfo>>(`${this.URL_AUTH}/me`, peticion).pipe(
      map((respuesta) => respuesta.data),
      tap((usuario) => this.guardarUsuario(usuario)),
    );
  }

  /**
   * Sustituye la foto de perfil.
   *
   * Envía el archivo como parte `photo` de un `multipart/form-data` y guarda el
   * `UserInfo` que devuelve el backend para que la barra y el perfil se actualicen.
   */
  actualizarFoto(foto: File): Observable<UserInfo> {
    const cuerpo = new FormData();
    cuerpo.append('photo', foto);

    return this.http.post<ApiResponse<UserInfo>>(`${this.URL_AUTH}/me/photo`, cuerpo).pipe(
      map((respuesta) => respuesta.data),
      tap((usuario) => this.guardarUsuario(usuario)),
    );
  }

  /** Elimina la foto de perfil y guarda el `UserInfo` actualizado (con `photo: null`). */
  eliminarFoto(): Observable<UserInfo> {
    return this.http
      .delete<ApiResponse<UserInfo>>(`${this.URL_AUTH}/me/photo`)
      .pipe(map((respuesta) => respuesta.data), tap((usuario) => this.guardarUsuario(usuario)));
  }

  /**
   * Restaura la sesión al arrancar: si hay token, lo valida contra `/me`.
   * Cualquier fallo limpia la sesión.
   */
  async restaurarSesion(): Promise<void> {
    if (!this.hayToken()) {
      return;
    }

    try {
      const respuesta = await firstValueFrom(
        this.http.get<ApiResponse<UserInfo>>(`${this.URL_AUTH}/me`),
      );
      this.guardarUsuario(respuesta.data);
    } catch {
      this.limpiarSesion();
    }
  }

  /** Cierra la sesión y vuelve a la portada. */
  cerrarSesion(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }

  /** Limpia la sesión caducada y lleva al login. */
  sesionCaducada(): void {
    this.limpiarSesion();
    this.router.navigate(['/auth/login']);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    this.guardarUsuario(respuesta.user);
  }

  /** Mantiene sincronizados el signal de sesión y `temia_user`. */
  private guardarUsuario(usuario: UserInfo): void {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    this._usuario.set(usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this._usuario.set(null);
  }

  private hayToken(): boolean {
    return !!localStorage.getItem(CLAVE_TOKEN);
  }
}
