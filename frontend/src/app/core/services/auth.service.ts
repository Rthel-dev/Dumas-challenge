import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { UserStoreService } from './user-store.service';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  currentUserId = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private userStore: UserStoreService,
    private router: Router,
  ) {}

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

  refresh(): Observable<string> {
    return this.http
      .post<AuthResponse>(`${this.api}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((res) => this.tokenService.set(res.accessToken)),
        map((res) => res.accessToken),
      );
  }

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
