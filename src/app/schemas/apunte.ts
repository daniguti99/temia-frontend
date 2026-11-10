import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
/** Longitud mínima del título de un apunte. */
export const TITULO_APUNTE_MIN = 3;

/** Longitud máxima del título de un apunte. */
export const TITULO_APUNTE_MAX = 100;

/**
 * Rechaza títulos que solo contienen espacios.
 *
 * Se aplica después de `required` y de las longitudes: un título de tres espacios
 * pasaría `minLength`, pero no debe considerarse válido.
 */
export function tituloApunteValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string' || valor.length === 0) {
      return null;
    }
    const limpio = valor.trim();
    if (limpio.length === 0) {
      return { soloEspacios: true };
    }
    return limpio.length < TITULO_APUNTE_MIN ? { tituloCorto: true } : null;
  };
}

/** Rechaza textos que solo contienen espacios. */
export function textoApunteValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string') {
      return null;
    }
    return valor.trim().length === 0 ? { soloEspacios: true } : null;
  };
}

/** Traduce los errores del título a un mensaje para el usuario. */
export function mensajeErrorTitulo(errores: ValidationErrors | null): string | null {
  if (!errores) {
    return null;
  }
  if (errores['required'] || errores['soloEspacios']) {
    return 'Rellene el título';
  }
  if (errores['minlength'] || errores['tituloCorto']) {
    return `El título debe tener al menos ${TITULO_APUNTE_MIN} caracteres`;
  }
  if (errores['maxlength']) {
    return `El título no puede superar ${TITULO_APUNTE_MAX} caracteres`;
  }
  return null;
}

/** Traduce los errores del texto a un mensaje para el usuario. */
export function mensajeErrorTexto(errores: ValidationErrors | null): string | null {
  if (!errores) {
    return null;
  }
  if (errores['required'] || errores['soloEspacios']) {
    return 'Rellene el texto';
  }
  return null;
}
