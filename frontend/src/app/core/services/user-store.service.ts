import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  private readonly api = environment.apiUrl;

  currentUser = signal<UserProfile | null>(null);

  constructor(private http: HttpClient) {}

  loadProfile(): void {
    this.http
      .get<UserProfile>(`${this.api}/users/me`)
      .subscribe({
        next: (user) => this.currentUser.set(user),
      });
  }

  clear(): void {
    this.currentUser.set(null);
  }
}
