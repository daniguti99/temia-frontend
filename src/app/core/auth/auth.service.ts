import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom, tap } from 'rxjs';

import { API_URL } from '../../api/api.config';
import { AuthResponse, LoginRequest, RegisterRequest, UserInfo } from '../models/auth';

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
      .post<AuthResponse>(`${this.URL_AUTH}/login`, peticion)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  /** Crea la cuenta y envía la foto opcional como parte `photo`. */
  registrar(datos: RegisterRequest, foto: File | null): Observable<AuthResponse> {
    const cuerpo = new FormData();
    cuerpo.append('data', new Blob([JSON.stringify(datos)], { type: 'application/json' }));
    if (foto) {
      cuerpo.append('photo', foto);
    }

    return this.http.post<AuthResponse>(`${this.URL_AUTH}/register`, cuerpo);
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
      const usuario = await firstValueFrom(this.http.get<UserInfo>(`${this.URL_AUTH}/me`));
      this._usuario.set(usuario);
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    } catch {
      this.limpiarSesion();
    }
  }

  /** Cierra la sesión y vuelve a la portada. */
  cerrarSesion(): void {
    this.limpiarSesion();
    this.router.navigate(['/']);
  }

  private guardarSesion(respuesta: AuthResponse): void {
    localStorage.setItem(CLAVE_TOKEN, respuesta.token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.user));
    this._usuario.set(respuesta.user);
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
