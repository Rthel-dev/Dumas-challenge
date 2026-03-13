import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { EMPTY } from 'rxjs';
import { AuthComponent } from './auth.component';
import { AuthService } from '../core/services/auth.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let mockAuthService: { login: jasmine.Spy; register: jasmine.Spy };

  beforeEach(async () => {
    mockAuthService = {
      login: jasmine.createSpy().and.returnValue(EMPTY),
      register: jasmine.createSpy().and.returnValue(EMPTY),
    };

    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => expect(component).toBeTruthy());

  it('loginForm and registerForm are defined', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.registerForm).toBeDefined();
  });

  it('switchTab sets activeTab and clears errorMessage', () => {
    component.switchTab('register');
    expect(component.activeTab()).toBe('register');
    expect(component.errorMessage()).toBeNull();
  });

  it('onLogin() with invalid form does not call authService.login', () => {
    // loginForm has email, password, remember — leave email/password empty (invalid)
    component.loginForm.setValue({ email: '', password: '', remember: false });
    component.onLogin();
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('onLogin() with valid form calls authService.login with email and password', () => {
    component.loginForm.setValue({ email: 'a@b.com', password: 'pass123', remember: false });
    component.onLogin();
    expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass123' });
  });

  it('onRegister() with invalid form does not call authService.register', () => {
    // registerForm has fullName, email, password — leave required fields empty (invalid)
    component.registerForm.setValue({ fullName: '', email: '', password: '' });
    component.onRegister();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('onRegister() with valid form calls authService.register with email and password', () => {
    component.registerForm.setValue({ fullName: 'Test User', email: 'a@b.com', password: 'pass123' });
    component.onRegister();
    expect(mockAuthService.register).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass123' });
  });

  it('dismissError sets errorMessage to null', () => {
    component.dismissError();
    expect(component.errorMessage()).toBeNull();
  });
});
