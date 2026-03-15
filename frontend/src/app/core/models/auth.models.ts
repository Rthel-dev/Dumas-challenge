/** Cuerpo de la solicitud de inicio de sesion. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Cuerpo de la solicitud de registro. */
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

/** Respuesta del servidor al autenticar o registrar un usuario. */
export interface AuthResponse {
  accessToken: string;
  userId: string;
}

/** Perfil publico del usuario autenticado. */
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}
