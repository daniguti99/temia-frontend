import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024;

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

/** Valida la foto de perfil: JPG, PNG o WEBP y 2 MB como máximo. */
export function imagenPerfilValida(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const archivo = control.value as File | null;

    if (!archivo) {
      return null;
    }
    if (!TIPOS_IMAGEN.includes(archivo.type)) {
      return { tipoNoPermitido: true };
    }
    if (archivo.size > TAMANO_MAXIMO) {
      return { demasiadoGrande: true };
    }
    return null;
  };
}
