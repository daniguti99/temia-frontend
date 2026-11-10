import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ApiError } from '../../../core/models/auth';
import { ApunteDetalle } from '../../../core/models/apunte';
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
import { formatearFecha } from '../../../utils/fecha';

type CampoApunte = 'titulo' | 'texto';

@Component({
  selector: 'app-detalle-apunte',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './detalle.html',
  styleUrl: './detalle.css',
})
export class DetalleApunte {
  /** Parámetro `:id` de la ruta, enlazado por `withComponentInputBinding`. */
  readonly id = input.required<string>();

  private readonly apunteService = inject(ApunteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly avisos = inject(AvisosService);

  protected readonly apunte = signal<ApunteDetalle | null>(null);
  protected readonly cargando = signal(true);
  protected readonly editando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly eliminando = signal(false);
  protected readonly fecha = formatearFecha;

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

  constructor() {
    effect(() => {
      const id = Number(this.id());
      if (!Number.isInteger(id) || id <= 0) {
        this.volverAlListado();
        return;
      }
      this.cargar(id);
    });
  }

  protected esInvalido(campo: CampoApunte): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  protected mensajeError(campo: CampoApunte): string | null {
    const errores = this.formulario.controls[campo].errors;

    return campo === 'titulo' ? mensajeErrorTitulo(errores) : mensajeErrorTexto(errores);
  }

  protected editar(): void {
    const actual = this.apunte();
    if (!actual) {
      return;
    }

    this.formulario.reset({ titulo: actual.titulo, texto: actual.texto });
    this.editando.set(true);
  }

  protected cancelar(): void {
    this.editando.set(false);
    this.formulario.reset();
  }

  protected guardar(): void {
    this.formulario.markAllAsTouched();

    const actual = this.apunte();
    if (!actual || this.formulario.invalid || this.guardando()) {
      return;
    }

    const valores = this.formulario.getRawValue();
    this.guardando.set(true);

    this.apunteService
      .actualizar(actual.id, {
        titulo: valores.titulo.trim(),
        texto: valores.texto.trim(),
      })
      .subscribe({
        next: (apunte) => {
          this.apunte.set(apunte);
          this.guardando.set(false);
          this.editando.set(false);
          this.avisos.exito('Apunte actualizado correctamente.');
        },
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);
          this.gestionarError(error, 'No se ha podido actualizar el apunte');
        },
      });
  }

  protected eliminar(): void {
    const actual = this.apunte();
    if (!actual || this.eliminando()) {
      return;
    }

    this.avisos.estaConfirmado('¿Quieres eliminar este apunte? No se puede deshacer.').then(
      (confirmado) => {
        if (!confirmado) {
          return;
        }

        this.eliminando.set(true);

        this.apunteService.eliminar(actual.id).subscribe({
          next: () => {
            this.eliminando.set(false);
            this.avisos.exito('Apunte eliminado correctamente.');
            this.volverAlListado();
          },
          error: (error: HttpErrorResponse) => {
            this.eliminando.set(false);
            this.gestionarError(error, 'No se ha podido eliminar el apunte');
          },
        });
      },
    );
  }

  private cargar(id: number): void {
    this.cargando.set(true);

    this.apunteService.obtener(id).subscribe({
      next: (apunte) => {
        this.apunte.set(apunte);
        this.formulario.reset({ titulo: apunte.titulo, texto: apunte.texto });
        this.cargando.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.apunte.set(null);
        this.cargando.set(false);

        if (error.status === 404) {
          this.avisos.error('El apunte no existe o no es tuyo.');
          this.volverAlListado();
          return;
        }

        this.gestionarError(error, 'No se ha podido cargar el apunte');
      },
    });
  }

  private gestionarError(error: HttpErrorResponse, mensaje: string): void {
    if (error.status === 401) {
      this.avisos.error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
      this.auth.sesionCaducada();
      return;
    }

    if (error.status === 404) {
      this.avisos.error('El apunte no existe o no es tuyo.');
      this.volverAlListado();
      return;
    }

    const cuerpo = error.error as ApiError | null;
    this.avisos.error(
      error.status === 0
        ? 'No se ha podido conectar con el servidor'
        : (cuerpo?.message ?? mensaje),
    );
  }

  private volverAlListado(): void {
    this.router.navigate(['/apuntes']);
  }
}
