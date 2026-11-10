/** Apunte tal y como aparece en `GET /api/apuntes` (`ApunteListado`). */
export interface ApunteListado {
  id: number;
  titulo: string;
  actualizadoEn: string;
}

/** Apunte completo de `GET /api/apuntes/{id}` (`ApunteDetalle`). */
export interface ApunteDetalle {
  id: number;
  titulo: string;
  texto: string;
  creadoEn: string;
  actualizadoEn: string | null;
}

/** Cuerpo de `POST /api/apuntes` (`NuevoApunteTexto`). */
export interface NuevoApunteTexto {
  titulo: string;
  texto: string;
}

/** Cuerpo de `PATCH /api/apuntes/{id}`: se envía solo lo que cambia. */
export interface ActualizarApunte {
  titulo?: string;
  texto?: string;
}
