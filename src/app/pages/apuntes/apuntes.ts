import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { ApiError } from '../../core/models/auth';
import { ApunteService } from '../../services/apunte.service';
import { AvisosService } from '../../services/avisos.service';
import { formatearFecha } from '../../utils/fecha';

@Component({
  selector: 'app-apuntes',
  imports: [RouterLink],
  templateUrl: './apuntes.html',
  styleUrl: './apuntes.css',
})
export class Apuntes {
  private readonly apunteService = inject(ApunteService);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(AvisosService);

  protected readonly apuntes = this.apunteService.apuntes;
  protected readonly cargando = signal(true);
  protected readonly fecha = formatearFecha;

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);

    this.apunteService.listar().subscribe({
      next: () => this.cargando.set(false),
      error: (error: HttpErrorResponse) => {
        this.cargando.set(false);
        this.gestionarError(error);
      },
    });
  }

  private gestionarError(error: HttpErrorResponse): void {
    if (error.status === 401) {
      this.avisos.error('Tu sesión ha caducado. Vuelve a iniciar sesión.');
      this.auth.sesionCaducada();
      return;
    }

    const cuerpo = error.error as ApiError | null;
    this.avisos.error(
      error.status === 0
        ? 'No se ha podido conectar con el servidor'
        : (cuerpo?.message ?? 'No se han podido cargar los apuntes'),
    );
  }
}
