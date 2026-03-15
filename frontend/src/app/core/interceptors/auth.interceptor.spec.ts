import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let mockTokenService: jasmine.SpyObj<TokenService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockTokenService = jasmine.createSpyObj('TokenService', ['get']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['refresh', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: TokenService, useValue: mockTokenService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be defined', () => expect(authInterceptor).toBeDefined());

  it('adds Authorization header when token present on non-auth route', () => {
    mockTokenService.get.and.returnValue('myToken');
    httpClient.get('/api/data').subscribe();
    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.get('Authorization')).toBe('Bearer myToken');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});
  });

  it('does not add Authorization header on /auth/login even when token present', () => {
    mockTokenService.get.and.returnValue('myToken');
    httpClient.get('/auth/login').subscribe();
    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('does not add Authorization header on /auth/register even when token present', () => {
    mockTokenService.get.and.returnValue('myToken');
    httpClient.get('/auth/register').subscribe();
    const req = httpMock.expectOne('/auth/register');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('sets withCredentials on requests to auth endpoints', () => {
    mockTokenService.get.and.returnValue(null);
    httpClient.get('/auth/login').subscribe();
    const req = httpMock.expectOne('/auth/login');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({});
  });

  it('calls refresh once when multiple requests get 401 simultaneously', () => {
    mockTokenService.get.and.returnValue('expiredToken');
    // Use a Subject to simulate async refresh (doesn't complete immediately)
    const refresh$ = new Subject<string>();
    mockAuthService.refresh.and.returnValue(refresh$);

    // Fire two requests simultaneously
    httpClient.get('/api/tasks').subscribe();
    httpClient.get('/api/users/me').subscribe();

    // Both get 401
    const reqs = httpMock.match((r) => r.url === '/api/tasks' || r.url === '/api/users/me');
    expect(reqs.length).toBe(2);
    reqs.forEach((r) => r.flush({}, { status: 401, statusText: 'Unauthorized' }));

    // refresh should have been called only once (both 401s share the same refresh)
    expect(mockAuthService.refresh).toHaveBeenCalledTimes(1);

    // Complete the refresh with new token
    refresh$.next('newToken');
    refresh$.complete();

    // Both retries should fire with new token
    const retries = httpMock.match((r) => r.url === '/api/tasks' || r.url === '/api/users/me');
    expect(retries.length).toBe(2);
    retries.forEach((r) => {
      expect(r.request.headers.get('Authorization')).toBe('Bearer newToken');
      r.flush({});
    });
  });
});
