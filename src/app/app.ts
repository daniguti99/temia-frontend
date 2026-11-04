import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './components/layout/footer/footer';
import { NavBar } from './components/layout/nav-bar/nav-bar';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly auth = inject(AuthService);

  protected readonly usuario = this.auth.usuario;

  protected cerrarSesion(): void {
    this.auth.cerrarSesion();
  }
}
