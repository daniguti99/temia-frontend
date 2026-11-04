import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

/**
 * Único punto de salida de avisos de la interfaz.
 *
 * Ningún componente importa `sweetalert2` directamente: pide el aviso aquí y este
 * servicio se encarga del título, los botones y el tema (ver `src/styles/avisos.css`).
 * Así cambiar el aspecto de todos los avisos es tocar un solo archivo.
 */
@Injectable({ providedIn: 'root' })
export class AvisosService {
  /** Confirma que una acción ha salido bien. */
  exito(texto: string, titulo = 'Hecho'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'success',
      title: titulo,
      text: texto,
      confirmButtonText: 'Vale',
    });
  }

  /** Informa de un fallo. */
  error(texto: string, titulo = 'Algo ha fallado'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'error',
      title: titulo,
      text: texto,
      confirmButtonText: 'Vale',
    });
  }

  /** Advierte de algo sin bloquear la acción. */
  aviso(texto: string, titulo = 'Atención'): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: texto,
      confirmButtonText: 'Vale',
    });
  }

  /** Pide confirmación antes de una acción destructiva. */
  confirmar(
    texto: string,
    titulo = '¿Seguro?',
    textoConfirmar = 'Sí',
    textoCancelar = 'Cancelar',
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      icon: 'warning',
      title: titulo,
      text: texto,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: textoCancelar,
      reverseButtons: true,
    });
  }

  /** Igual que `confirmar`, pero devuelve solo si se aceptó. */
  async estaConfirmado(texto: string, titulo = '¿Seguro?'): Promise<boolean> {
    const resultado = await this.confirmar(texto, titulo);
    return resultado.isConfirmed;
  }
}
