import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Avatar } from '../../components/shared/avatar/avatar';
import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/models/auth';
import { AvisosService } from '../../services/avisos.service';
import { cambioPasswordCoherente, sinSoloEspacios } from '../../schemas/auth';

type CampoPassword = 'currentPassword' | 'newPassword' | 'confirmPassword';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, Avatar, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly avisos = inject(AvisosService);

  protected readonly usuario = this.auth.usuario;

  protected readonly etiquetaRol = computed(() =>
    this.usuario()?.role === 'ADMIN' ? 'Administrador' : 'Estudiante',
  );

  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly verActual = signal(false);
  protected readonly verNueva = signal(false);
  protected readonly verConfirmacion = signal(false);

  protected readonly formulario = this.fb.nonNullable.group(
    {
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          sinSoloEspacios(),
        ],
      ],
      currentPassword: [''],
      newPassword: [''],
      confirmPassword: [''],
    },
    { validators: [cambioPasswordCoherente()] },
  );

  protected editar(): void {
    this.rellenarFormulario();
    this.editando.set(true);
  }

  protected cancelar(): void {
    this.rellenarFormulario();
    this.editando.set(false);
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.guardando()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardando.set(true);

    this.auth
      .actualizarPerfil({
        username: valores.username.trim(),
        currentPassword: valores.currentPassword,
        newPassword: valores.newPassword,
        confirmPassword: valores.confirmPassword,
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.editando.set(false);
          this.rellenarFormulario();
          this.avisos.exito('Tus datos se han guardado.');
        },
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);

          if (error.status === 401) {
            this.avisos.error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
            this.auth.sesionCaducada();
            return;
          }

          this.avisos.error(this.mensajeDeError(error));
          this.formulario.controls.currentPassword.reset();
          this.formulario.controls.newPassword.reset();
          this.formulario.controls.confirmPassword.reset();
        },
      });
  }

  protected esUsernameInvalido(): boolean {
    const control = this.formulario.controls.username;
    return control.invalid && control.touched;
  }

  protected mensajeUsername(): string | null {
    const errores = this.formulario.controls.username.errors ?? {};

    if (errores['required'] || errores['soloEspacios']) {
      return 'Rellene el nombre de usuario';
    }
    if (errores['minlength']) {
      return 'Debe tener al menos 3 caracteres';
    }
    if (errores['maxlength']) {
      return 'No puede superar 50 caracteres';
    }
    return null;
  }

  /** Marca los tres campos de contraseña cuando la sección tiene un error visible. */
  protected passwordConError(): boolean {
    const tocado =
      this.formulario.controls.currentPassword.touched ||
      this.formulario.controls.newPassword.touched ||
      this.formulario.controls.confirmPassword.touched;
    const errores = this.formulario.errors;

    if (!tocado || !errores) {
      return false;
    }
    return (
      'faltaPasswordActual' in errores ||
      'faltaPasswordNueva' in errores ||
      'nuevaPasswordCorta' in errores ||
      'contrasenasDistintas' in errores
    );
  }

  protected errorPassword(): string | null {
    if (!this.passwordConError()) {
      return null;
    }
    if (this.formulario.hasError('faltaPasswordActual')) {
      return 'Escribe tu contraseña actual para cambiarla.';
    }
    if (this.formulario.hasError('faltaPasswordNueva')) {
      return 'Escribe la contraseña nueva.';
    }
    if (this.formulario.hasError('nuevaPasswordCorta')) {
      return 'La contraseña nueva debe tener al menos 8 caracteres.';
    }
    if (this.formulario.hasError('contrasenasDistintas')) {
      return 'Las contraseñas nuevas no coinciden.';
    }
    return null;
  }

  protected alternar(campo: CampoPassword): void {
    if (campo === 'currentPassword') {
      this.verActual.update((visible) => !visible);
    } else if (campo === 'newPassword') {
      this.verNueva.update((visible) => !visible);
    } else {
      this.verConfirmacion.update((visible) => !visible);
    }
  }

  protected visible(campo: CampoPassword): boolean {
    if (campo === 'currentPassword') {
      return this.verActual();
    }
    if (campo === 'newPassword') {
      return this.verNueva();
    }
    return this.verConfirmacion();
  }

  private rellenarFormulario(): void {
    this.formulario.reset({
      username: this.usuario()?.username ?? '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  }

  private mensajeDeError(error: HttpErrorResponse): string {
    const cuerpo = error.error as ApiError | null;

    if (error.status === 0) {
      return 'No se ha podido conectar con el servidor';
    }
    return cuerpo?.message ?? 'No se ha podido actualizar el perfil';
  }
}
