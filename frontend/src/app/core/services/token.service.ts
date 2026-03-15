import { Injectable } from '@angular/core';

/** Servicio que gestiona el almacenamiento del access token JWT en localStorage. */
@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly KEY = 'access_token';

  /**
   * Obtiene el access token almacenado.
   * @returns El token o `null` si no existe.
   */
  get(): string | null {
    return localStorage.getItem(this.KEY);
  }

  /**
   * Almacena el access token en localStorage.
   * @param token - Token JWT a guardar.
   */
  set(token: string): void {
    localStorage.setItem(this.KEY, token);
  }

  /** Elimina el access token de localStorage. */
  clear(): void {
    localStorage.removeItem(this.KEY);
  }

  /**
   * Verifica si existe un access token almacenado.
   * @returns `true` si hay un token presente.
   */
  isLoggedIn(): boolean {
    return !!this.get();
  }
}
