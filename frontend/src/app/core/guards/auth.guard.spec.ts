import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, UrlTree } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { TokenService } from '../services/token.service';

describe('authGuard', () => {
  let mockTokenService: jasmine.SpyObj<TokenService>;

  beforeEach(() => {
    mockTokenService = jasmine.createSpyObj('TokenService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: TokenService, useValue: mockTokenService },
      ],
    });
  });

  it('should be defined', () => expect(authGuard).toBeDefined());

  it('returns true when logged in', () => {
    mockTokenService.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeTrue();
  });

  it('returns UrlTree to /auth when not logged in', () => {
    mockTokenService.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    expect(result).toBeInstanceOf(UrlTree);
  });
});
