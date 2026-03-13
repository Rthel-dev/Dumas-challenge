import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="container py-5">
      <h1 class="fw-bold mb-4">Dashboard</h1>
      <button class="btn btn-outline-dark" (click)="authService.logout()">Cerrar sesión</button>
    </div>
  `,
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
