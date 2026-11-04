import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/models/auth';
import { AvisosService } from '../../../services/avisos.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly avisos = inject(AvisosService);

  protected readonly enviando = signal(false);
  protected readonly verPassword = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected esCampoInvalido(campo: 'login' | 'password'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected alternarPassword(): void {
    this.verPassword.update((visible) => !visible);
  }

  protected entrar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.enviando()) {
      return;
    }

    this.enviando.set(true);
    this.auth.login(this.formulario.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        this.router.navigate(['/']);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        this.avisos.error(this.mensajeDeError(error));
        this.formulario.controls.password.reset();
      },
    });
  }

  private mensajeDeError(error: HttpErrorResponse): string {
    const cuerpo = error.error as ApiError | null;

    if (error.status === 0) {
      return 'No se ha podido conectar con el servidor';
    }
    return cuerpo?.message ?? 'No se ha podido iniciar sesión';
  }
}
