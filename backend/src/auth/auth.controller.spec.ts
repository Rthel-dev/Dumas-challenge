import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
};

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('false');
  });

  describe('register', () => {
    it('calls authService.register, sets refresh_token cookie with httpOnly and correct path, returns accessToken and userId', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userId: 'uid1',
      });

      const result = await controller.register({ fullName: 'Test User', email: 'a@b.com', password: 'pw' }, mockRes as any);

      expect(mockAuthService.register).toHaveBeenCalledWith({ fullName: 'Test User', email: 'a@b.com', password: 'pw' });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true, path: '/auth/refresh' }),
      );
      expect(result).toEqual({ accessToken: 'access', userId: 'uid1' });
      expect(result).not.toHaveProperty('refreshToken');
    });
  });

  describe('login', () => {
    it('calls authService.login, sets cookie, returns accessToken and userId without refreshToken', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
        userId: 'uid1',
      });

      const result = await controller.login({ email: 'a@b.com', password: 'pw' }, mockRes as any);

      expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pw' });
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh',
        expect.objectContaining({ httpOnly: true, path: '/auth/refresh' }),
      );
      expect(result).toEqual({ accessToken: 'access', userId: 'uid1' });
    });

    it('propagates UnauthorizedException from authService', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login({ email: 'a@b.com', password: 'wrong' }, mockRes as any)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException if no refresh_token cookie', async () => {
      const req = { cookies: {} } as any;

      await expect(controller.refresh(req, mockRes as any)).rejects.toThrow(
        new UnauthorizedException('No refresh token provided'),
      );
    });

    it('calls jwtService.verifyAsync with token and refresh secret, then authService.refresh with payload.sub', async () => {
      mockConfigService.get.mockImplementation((key: string) =>
        key === 'JWT_REFRESH_SECRET' ? 'refresh-secret' : 'false',
      );
      const req = { cookies: { refresh_token: 'rawToken' } } as any;
      mockJwtService.verifyAsync.mockResolvedValue({ sub: 'uid1' });
      mockAuthService.refresh.mockResolvedValue({
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
        userId: 'uid1',
      });

      const result = await controller.refresh(req, mockRes as any);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('rawToken', { secret: 'refresh-secret' });
      expect(mockAuthService.refresh).toHaveBeenCalledWith('uid1', 'rawToken');
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'newRefresh',
        expect.objectContaining({ httpOnly: true, path: '/auth/refresh' }),
      );
      expect(result).toEqual({ accessToken: 'newAccess', userId: 'uid1' });
    });

    it('throws UnauthorizedException with correct message when verifyAsync rejects', async () => {
      const req = { cookies: { refresh_token: 'badToken' } } as any;
      mockJwtService.verifyAsync.mockRejectedValue(new Error('expired'));

      await expect(controller.refresh(req, mockRes as any)).rejects.toThrow(
        new UnauthorizedException('Invalid or expired refresh token'),
      );
    });
  });

  describe('logout', () => {
    it('calls authService.logout with userId and clears the cookie', async () => {
      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout('uid1', mockRes as any);

      expect(mockAuthService.logout).toHaveBeenCalledWith('uid1');
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.objectContaining({ path: '/auth/refresh' }),
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('refreshCookieOptions', () => {
    it('sets secure: true when COOKIE_SECURE is "true"', () => {
      mockConfigService.get.mockReturnValue('true');

      // Access private method via bracket notation
      const options = (controller as any).refreshCookieOptions();

      expect(options.secure).toBe(true);
    });

    it('sets secure: false when COOKIE_SECURE is not "true"', () => {
      mockConfigService.get.mockReturnValue('false');

      const options = (controller as any).refreshCookieOptions();

      expect(options.secure).toBe(false);
    });
  });
});
