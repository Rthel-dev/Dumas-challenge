export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}
