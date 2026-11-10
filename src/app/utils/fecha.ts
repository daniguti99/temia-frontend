/**
 * Formatea una fecha ISO del backend en español.
 *
 * Se usa `Intl.DateTimeFormat` para no depender de que Angular tenga registrado el
 * locale `es-ES`, que no es el caso en `app.config.ts`.
 */
export function formatearFecha(fecha: string | null | undefined): string {
  if (!fecha) {
    return '';
  }

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(valor);
}
