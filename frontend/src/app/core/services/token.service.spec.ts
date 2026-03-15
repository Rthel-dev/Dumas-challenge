import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenService],
    });
    service = TestBed.inject(TokenService);
  });

  it('should be defined', () => expect(service).toBeTruthy());

  it('get() returns stored token', () => {
    spyOn(localStorage, 'getItem').and.returnValue('tok');
    expect(service.get()).toBe('tok');
  });

  it('set(token) stores token', () => {
    const spy = spyOn(localStorage, 'setItem');
    service.set('myToken');
    expect(spy).toHaveBeenCalledWith('access_token', 'myToken');
  });

  it('clear() removes token', () => {
    const spy = spyOn(localStorage, 'removeItem');
    service.clear();
    expect(spy).toHaveBeenCalledWith('access_token');
  });

  it('isLoggedIn() returns true when token exists', () => {
    spyOn(localStorage, 'getItem').and.returnValue('someToken');
    expect(service.isLoggedIn()).toBeTrue();
  });

  it('isLoggedIn() returns false when no token', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    expect(service.isLoggedIn()).toBeFalse();
  });
});
