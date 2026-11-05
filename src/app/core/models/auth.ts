/** Usuario tal y como lo devuelve el backend (`UserInfo`). */
export interface UserInfo {
  id: number;
  username: string;
  email: string;
  photo: string | null;
  role: 'USER' | 'ADMIN';
}

/** Cuerpo de `POST /api/auth/login`. El campo `login` admite email o usuario. */
export interface LoginRequest {
  login: string;
  password: string;
}

/** Cuerpo de `POST /api/auth/register` (parte `data` del multipart). */
export interface RegisterRequest {
  username: string;
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

/**
 * Cuerpo de `PATCH /api/auth/me`.
 *
 * El email no se envía: identifica la cuenta y no se puede cambiar. Los campos de
 * contraseña vacíos significan «no cambiar la contraseña».
 */
export interface ActualizarPerfilRequest {
  username: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Respuesta de login y registro. */
export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: UserInfo;
}

/** Envelope común de todas las respuestas correctas de la API (`ApiResponse<T>`). */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Cuerpo de error de la API (`ApiError` del backend). */
export interface ApiError {
  success: false;
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
