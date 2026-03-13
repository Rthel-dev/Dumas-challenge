import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { UserStoreService } from './user-store.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTokenService: jasmine.SpyObj<TokenService>;
  let mockUserStore: jasmine.SpyObj<UserStoreService>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTokenService = jasmine.createSpyObj('TokenService', ['set', 'clear', 'get']);
    mockUserStore = jasmine.createSpyObj('UserStoreService', ['loadProfile', 'clear']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: TokenService, useValue: mockTokenService },
        { provide: UserStoreService, useValue: mockUserStore },
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be defined', () => expect(service).toBeTruthy());

  it('login() stores token, sets userId, loads profile, navigates to /dashboard', () => {
    service.login({ email: 'a@b.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/login'));
    req.flush({ accessToken: 'tok', userId: 'u1' });
    expect(mockTokenService.set).toHaveBeenCalledWith('tok');
    expect(service.currentUserId()).toBe('u1');
    expect(mockUserStore.loadProfile).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('register() stores token, sets userId, loads profile, navigates to /dashboard', () => {
    service.register({ fullName: 'Test User', email: 'a@b.com', password: 'pass' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/register'));
    req.flush({ accessToken: 'tok', userId: 'u1' });
    expect(mockTokenService.set).toHaveBeenCalledWith('tok');
    expect(service.currentUserId()).toBe('u1');
    expect(mockUserStore.loadProfile).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('logout() clears token, sets userId null, clears user store, navigates to /auth', () => {
    mockTokenService.get.and.returnValue(null);
    service.logout();
    const req = httpMock.expectOne((r) => r.url.includes('/auth/logout'));
    req.flush({});
    expect(mockTokenService.clear).toHaveBeenCalled();
    expect(service.currentUserId()).toBeNull();
    expect(mockUserStore.clear).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
