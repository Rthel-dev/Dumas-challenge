import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTokenService = jasmine.createSpyObj('TokenService', ['set', 'clear', 'get']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: TokenService, useValue: mockTokenService },
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be defined', () => expect(service).toBeTruthy());

  it('login() stores token, sets userId, navigates to /dashboard', () => {
    service.login({ email: 'a@b.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ accessToken: 'tok', userId: 'u1' });
    expect(mockTokenService.set).toHaveBeenCalledWith('tok');
    expect(service.currentUserId()).toBe('u1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('register() stores token, sets userId, navigates to /dashboard', () => {
    service.register({ email: 'a@b.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/register'));
    req.flush({ accessToken: 'tok', userId: 'u1' });
    expect(mockTokenService.set).toHaveBeenCalledWith('tok');
    expect(service.currentUserId()).toBe('u1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('logout() clears token, sets userId null, navigates to /auth', () => {
    mockTokenService.get.and.returnValue(null);
    service.logout();
    // logout fires a fire-and-forget HTTP request internally; flush it to satisfy httpMock.verify()
    const req = httpMock.expectOne((r) => r.url.includes('/auth/logout'));
    req.flush({});
    expect(mockTokenService.clear).toHaveBeenCalled();
    expect(service.currentUserId()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
