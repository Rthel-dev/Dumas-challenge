import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, NgbAlertModule, NgbTooltipModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
/**
 * Componente de autenticacion que muestra formularios de login y registro
 * con pestanas intercambiables.
 */
export class AuthComponent {
  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  loginSubmitted = signal(false);
  registerSubmitted = signal(false);

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

  get lEmail() { return this.loginForm.get('email'); }
  get lPassword() { return this.loginForm.get('password'); }
  get rFullName() { return this.registerForm.get('fullName'); }
  get rEmail() { return this.registerForm.get('email'); }
  get rPassword() { return this.registerForm.get('password'); }

  /**
   * Cambia la pestana activa entre login y registro.
   * Limpia mensajes de error al cambiar.
   * @param tab - Pestana a activar.
   */
  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  /**
   * Envia el formulario de login.
   * Valida el formulario antes de enviar y muestra errores del servidor.
   */
  onLogin(): void {
    this.loginSubmitted.set(true);
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;
    this.authService.login({ email, password }).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        console.log(err)
        if (err.status === 401) this.errorMessage.set('Credenciales no válidas.');
        else this.errorMessage.set(err?.error?.message ?? 'Credenciales no válidas.');
      },
    });
  }

  /**
   * Envia el formulario de registro.
   * Valida el formulario antes de enviar y muestra errores del servidor.
   */
  onRegister(): void {
    this.registerSubmitted.set(true);
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    const { fullName, email, password } = this.registerForm.value;
    this.authService.register({ fullName, email, password }).subscribe({
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Error al registrarse.');
      },
    });
  }

  /** Descarta el mensaje de error visible. */
  dismissError(): void {
    this.errorMessage.set(null);
  }
}
