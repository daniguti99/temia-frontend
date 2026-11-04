import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Vista provisional para las secciones que aún no tienen funcionalidad. */
@Component({
  selector: 'app-pagina-pendiente',
  imports: [RouterLink],
  templateUrl: './pagina-pendiente.html',
  styleUrl: './pagina-pendiente.css',
})
export class PaginaPendiente {
  readonly titulo = input.required<string>();
  readonly descripcion = input<string>('');
}
