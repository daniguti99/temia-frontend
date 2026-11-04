import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-entrada',
  imports: [RouterLink],
  templateUrl: './entrada.html',
  styleUrl: './entrada.css',
})
export class Entrada {
  private auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
