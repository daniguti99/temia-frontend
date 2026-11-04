import { Component, computed, input, signal } from '@angular/core';

/**
 * Avatar del usuario.
 *
 * Si hay foto la muestra y, si la imagen falla o no existe, cae en la inicial del
 * nombre. La URL que ha fallado se recuerda para no volver a intentarla.
 */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.html',
  styleUrl: './avatar.css',
})
export class Avatar {
  readonly nombre = input.required<string>();
  readonly foto = input<string | null>(null);
  readonly tamano = input<'sm' | 'lg'>('sm');

  private readonly fotoConFallo = signal<string | null>(null);

  protected readonly inicial = computed(() => {
    const nombre = this.nombre().trim();
    return nombre ? nombre.charAt(0).toUpperCase() : '?';
  });

  protected readonly mostrarFoto = computed(() => {
    const foto = this.foto();
    return !!foto && foto !== this.fotoConFallo();
  });

  protected marcarFotoFallida(): void {
    this.fotoConFallo.set(this.foto());
  }
}
