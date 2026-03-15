import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/auth.models';

/**
 * Store reactivo para el perfil del usuario autenticado.
 * Expone el perfil como signal para consumo en componentes.
 */
@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly api = environment.apiUrl;

  /** Signal con el perfil del usuario actual, o `null` si no hay sesion. */
  currentUser = signal<UserProfile | null>(null);

  constructor(private http: HttpClient) {}

  /** Carga el perfil del usuario desde el endpoint `GET /users/me`. */
  loadProfile(): void {
    this.http
      .get<UserProfile>(`${this.api}/users/me`)
      .subscribe({
        next: (user) => this.currentUser.set(user),
      });
  }

  /** Limpia el perfil almacenado (usado al cerrar sesion). */
  clear(): void {
    this.currentUser.set(null);
  }
}
