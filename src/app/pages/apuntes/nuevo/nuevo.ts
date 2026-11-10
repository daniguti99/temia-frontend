import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/models/auth';
import {
  TITULO_APUNTE_MAX,
  TITULO_APUNTE_MIN,
  mensajeErrorTexto,
  mensajeErrorTitulo,
  textoApunteValido,
  tituloApunteValido,
} from '../../../schemas/apunte';
import { ApunteService } from '../../../services/apunte.service';
import { AvisosService } from '../../../services/avisos.service';

type CampoApunte = 'titulo' | 'texto';

@Component({
  selector: 'app-nuevo-apunte',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nuevo.html',
  styleUrl: './nuevo.css',
})
export class NuevoApunte {
  private readonly apunteService = inject(ApunteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly avisos = inject(AvisosService);

  protected readonly guardando = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    titulo: [
      '',
      [
        Validators.required,
        Validators.minLength(TITULO_APUNTE_MIN),
        Validators.maxLength(TITULO_APUNTE_MAX),
        tituloApunteValido(),
      ],
    ],
    texto: ['', [Validators.required, textoApunteValido()]],
  });

  protected esInvalido(campo: CampoApunte): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected mensajeError(campo: CampoApunte): string | null {
    const errores = this.formulario.controls[campo].errors;

    return campo === 'titulo' ? mensajeErrorTitulo(errores) : mensajeErrorTexto(errores);
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.guardando()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardando.set(true);

    this.apunteService
      .crear({
        titulo: valores.titulo.trim(),
        texto: valores.texto.trim(),
      })
      .subscribe({
        next: (apunte) => {
          this.guardando.set(false);
          this.avisos.exito('Apunte creado correctamente.');
          this.router.navigate(['/apuntes', apunte.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);

          if (error.status === 401) {
            this.avisos.error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
            this.auth.sesionCaducada();
            return;
          }

          const cuerpo = error.error as ApiError | null;
          this.avisos.error(
            error.status === 0
              ? 'No se ha podido conectar con el servidor'
              : (cuerpo?.message ?? 'No se ha podido crear el apunte'),
          );
        },
      });
  }
}
