import { Component, HostListener, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { UserInfo } from '../../../core/models/auth';
import { Avatar } from '../../shared/avatar/avatar';

interface EnlaceNavegacion {
  readonly etiqueta: string;
  readonly ruta: string;
}

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, RouterLinkActive, Avatar],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  readonly usuario = input.required<UserInfo>();
  readonly cerrarSesion = output<void>();

  private readonly router = inject(Router);

  protected readonly menuAbierto = signal(false);

  protected readonly enlaces: readonly EnlaceNavegacion[] = [
    { etiqueta: 'Inicio', ruta: '/' },
    { etiqueta: 'Apuntes', ruta: '/apuntes' },
    { etiqueta: 'Resúmenes', ruta: '/resumenes' },
    { etiqueta: 'Tests', ruta: '/tests' },
    { etiqueta: 'Perfil', ruta: '/perfil' },
  ];

  constructor() {
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.cerrarMenu());
  }

  @HostListener('document:keydown.escape')
  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected salir(): void {
    this.cerrarMenu();
    this.cerrarSesion.emit();
  }
}
