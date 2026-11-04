import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/models/auth';
import { AvisosService } from '../../../services/avisos.service';
import {
  contrasenasIguales,
  emailsIguales,
  imagenPerfilValida,
} from '../../../schemas/auth';

type CampoRegistro =
  | 'username'
  | 'email'
  | 'confirmEmail'
  | 'password'
  | 'confirmPassword'
  | 'foto';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly avisos = inject(AvisosService);
  private readonly destruccion = inject(DestroyRef);

  protected readonly enviando = signal(false);
  protected readonly vistaPrevia = signal<string | null>(null);
  protected readonly verPassword = signal(false);
  protected readonly verConfirmacion = signal(false);
  private urlVistaPrevia: string | null = null;

  protected readonly formulario = this.fb.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      foto: [null as File | null, [imagenPerfilValida()]],
    },
    { validators: [emailsIguales(), contrasenasIguales()] },
  );

  constructor() {
    this.destruccion.onDestroy(() => this.liberarVistaPrevia());
  }

  protected esCampoInvalido(campo: CampoRegistro): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected alternarPassword(): void {
    this.verPassword.update((visible) => !visible);
  }

  protected alternarConfirmacion(): void {
    this.verConfirmacion.update((visible) => !visible);
  }

  protected mensajeError(campo: CampoRegistro): string | null {
    const errores = this.formulario.controls[campo].errors ?? {};

    if (errores['required']) {
      return 'Este campo es obligatorio';
    }
    if (errores['minlength']) {
      return `Debe tener al menos ${errores['minlength'].requiredLength} caracteres`;
    }
    if (errores['email']) {
      return 'El formato del correo no es válido';
    }
    if (errores['tipoNoPermitido']) {
      return 'La foto debe ser JPG, PNG o WEBP';
    }
    if (errores['demasiadoGrande']) {
      return 'La foto no puede superar 2 MB';
    }
    return null;
  }

  protected inicial(): string {
    const username = this.formulario.controls.username.value ?? '';
    return username.charAt(0).toUpperCase() || '?';
  }

  protected alCambiarFoto(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0] ?? null;

    this.formulario.controls.foto.setValue(archivo);
    this.formulario.controls.foto.markAsTouched();

    this.liberarVistaPrevia();
    if (archivo) {
      this.urlVistaPrevia = URL.createObjectURL(archivo);
      this.vistaPrevia.set(this.urlVistaPrevia);
    }
  }

  protected registrar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.enviando()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    this.enviando.set(true);

    this.auth
      .registrar(
        {
          username: valores.username ?? '',
          email: valores.email ?? '',
          confirmEmail: valores.confirmEmail ?? '',
          password: valores.password ?? '',
          confirmPassword: valores.confirmPassword ?? '',
        },
        valores.foto,
      )
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.avisos.exito('Cuenta creada. Ya puedes iniciar sesión.');
          this.router.navigate(['/auth/login']);
        },
        error: (error: HttpErrorResponse) => {
          this.enviando.set(false);
          this.avisos.error(this.mensajeDeError(error));
          this.formulario.controls.password.reset();
          this.formulario.controls.confirmPassword.reset();
        },
      });
  }

  private mensajeDeError(error: HttpErrorResponse): string {
    const cuerpo = error.error as ApiError | null;

    if (error.status === 0) {
      return 'No se ha podido conectar con el servidor';
    }
    return cuerpo?.message ?? 'No se ha podido crear la cuenta';
  }

  private liberarVistaPrevia(): void {
    if (this.urlVistaPrevia) {
      URL.revokeObjectURL(this.urlVistaPrevia);
      this.urlVistaPrevia = null;
    }
    this.vistaPrevia.set(null);
  }
}
