import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { UserStoreService } from './user-store.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

/**
 * Servicio de autenticacion del frontend.
 *
 * Gestiona login, registro, refresh de tokens y logout.
 * Tras autenticacion exitosa, almacena el token, carga el perfil
 * y navega al dashboard.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  /** Signal con el ID del usuario actualmente autenticado. */
  currentUserId = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userStore: UserStoreService,
    private router: Router,
  ) {}

  /**
   * Inicia sesion con las credenciales proporcionadas.
   * Almacena el token, carga el perfil y redirige al dashboard.
   *
   * @param dto - Credenciales de login (email y contrasena).
   * @returns Observable con la respuesta de autenticacion.
   */
  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, dto).pipe(
      tap((res) => {
        this.tokenService.set(res.accessToken);
        this.currentUserId.set(res.userId);
        this.userStore.loadProfile();
        this.router.navigate(['/dashboard']);
      }),
    );
  }

  /**
   * Registra un nuevo usuario.
   * Almacena el token, carga el perfil y redirige al dashboard.
   *
   * @param dto - Datos de registro (nombre, email, contrasena).
   * @returns Observable con la respuesta de autenticacion.
   */
  register(dto: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/register`, dto).pipe(
      tap((res) => {
        this.tokenService.set(res.accessToken);
        this.currentUserId.set(res.userId);
        this.userStore.loadProfile();
        this.router.navigate(['/dashboard']);
      }),
    );
  }

  /**
   * Renueva el access token usando la cookie de refresh token.
   *
   * @returns Observable que emite el nuevo access token.
   */
  refresh(): Observable<string> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => this.tokenService.set(res.accessToken)),
        map((res) => res.accessToken),
      );
  }

  /**
   * Cierra la sesion: notifica al servidor, limpia el token y el perfil,
   * y navega a la pagina de autenticacion.
   */
  logout(): void {
    const token = this.tokenService.get();
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    this.http
      .post(`${this.api}/auth/logout`, {}, { headers, withCredentials: true })
      .subscribe({ error: () => {} });
    this.tokenService.clear();
    this.currentUserId.set(null);
    this.userStore.clear();
    this.router.navigate(['/auth']);
  }
}
