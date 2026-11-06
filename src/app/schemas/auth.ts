import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Tipos de imagen admitidos para la foto de perfil. */
export const TIPOS_IMAGEN_PERFIL = ['image/jpeg', 'image/png', 'image/webp'];

/** Tamaño máximo de la foto de perfil: 2 MB. */
export const TAMANO_MAXIMO_FOTO = 2 * 1024 * 1024;

/**
 * Comprueba un archivo de foto de perfil.
 *
 * Es la única fuente de verdad para el tipo y el tamaño: la usan el validador del
 * formulario de registro y la selección de foto de `/perfil`.
 */
export function validarImagenPerfil(archivo: File | null): ValidationErrors | null {
  if (!archivo) {
    return null;
  }
  if (!TIPOS_IMAGEN_PERFIL.includes(archivo.type)) {
    return { tipoNoPermitido: true };
  }
  if (archivo.size > TAMANO_MAXIMO_FOTO) {
    return { demasiadoGrande: true };
  }
  return null;
}

/** Traduce los errores de imagen a un mensaje para el usuario. */
export function mensajeErrorImagen(errores: ValidationErrors | null): string | null {
  if (!errores) {
    return null;
  }
  if (errores['tipoNoPermitido']) {
    return 'La foto debe ser JPG, PNG o WEBP';
  }
  if (errores['demasiadoGrande']) {
    return 'La foto no puede superar 2 MB';
  }
  return null;
}

/** Valida la foto de perfil: JPG, PNG o WEBP y 2 MB como máximo. */
export function imagenPerfilValida(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    validarImagenPerfil(control.value as File | null);
}

/** Marca el formulario cuando la contraseña y su confirmación no coinciden. */
export function contrasenasIguales(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const password = grupo.get('password')?.value;
    const confirmacion = grupo.get('confirmPassword')?.value;

    if (!password || !confirmacion) {
      return null;
    }
    return password === confirmacion ? null : { contrasenasDistintas: true };
  };
}

/** Marca el formulario cuando el email y su confirmación no coinciden. */
export function emailsIguales(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const email = grupo.get('email')?.value;
    const confirmacion = grupo.get('confirmEmail')?.value;

    if (!email || !confirmacion) {
      return null;
    }
    return email === confirmacion ? null : { emailsDistintos: true };
  };
}

/** Rechaza cadenas formadas solo por espacios. */
export function sinSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string' || valor.length === 0) {
      return null;
    }
    return valor.trim().length === 0 ? { soloEspacios: true } : null;
  };
}

/**
 * Valida la sección opcional de cambio de contraseña del perfil.
 *
 * Si los tres campos están vacíos no hay cambio. En cuanto se rellena uno, se exigen
 * la contraseña actual, la nueva y su confirmación.
 */
export function cambioPasswordCoherente(): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const actual = String(grupo.get('currentPassword')?.value ?? '');
    const nueva = String(grupo.get('newPassword')?.value ?? '');
    const confirmacion = String(grupo.get('confirmPassword')?.value ?? '');

    if (!actual && !nueva && !confirmacion) {
      return null;
    }
    if (!actual) {
      return { faltaPasswordActual: true };
    }
    if (!nueva) {
      return { faltaPasswordNueva: true };
    }
    if (nueva.length < 8) {
      return { nuevaPasswordCorta: true };
    }
    if (nueva !== confirmacion) {
      return { contrasenasDistintas: true };
    }
    return null;
  };
}
