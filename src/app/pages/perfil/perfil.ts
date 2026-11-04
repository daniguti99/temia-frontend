import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Avatar } from '../../components/shared/avatar/avatar';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [Avatar, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;

  protected readonly etiquetaRol = computed(() =>
    this.usuario()?.role === 'ADMIN' ? 'Administrador' : 'Estudiante',
  );
}
