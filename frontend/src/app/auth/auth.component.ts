import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faStarOfLife, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, NgbAlert, FaIconComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  faStarOfLife = faStarOfLife;
  faCircleQuestion = faCircleQuestion;

  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false],
    });

    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  onLogin(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Credenciales inválidas.');
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.registerForm.value;
    this.authService.register({ email, password }).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Error al registrarse.');
      },
    });
  }

  dismissError(): void {
    this.errorMessage.set(null);
  }
}
