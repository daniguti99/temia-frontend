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

/** Respuesta de login y registro. */
export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: UserInfo;
}

/** Cuerpo de error de la API (`ApiError` del backend). */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
