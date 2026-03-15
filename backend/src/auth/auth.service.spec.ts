import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByIdWithToken: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const configMap: Record<string, string> = {
  JWT_ACCESS_SECRET: 'access-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_SECRET: 'refresh-secret',
  JWT_REFRESH_EXPIRES_IN: '7d',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockConfigService.get.mockImplementation((key: string) => configMap[key]);
  });

  describe('register', () => {
    it('creates user, generates tokens, updates refresh token, and returns tokens', async () => {
      const user = { id: 'uid1', email: 'a@b.com' };
      mockUsersService.create.mockResolvedValue(user);
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register({
        fullName: 'Test User',
        email: 'a@b.com',
        password: 'secret',
      });

      expect(mockUsersService.create).toHaveBeenCalledWith({
        fullName: 'Test User',
        email: 'a@b.com',
        password: 'secret',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'uid1',
        'refreshToken',
      );
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        userId: 'uid1',
      });
    });

    it('propagates ConflictException without calling updateRefreshToken', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email already in use'),
      );

      await expect(
        service.register({
          fullName: 'Test User',
          email: 'a@b.com',
          password: 'secret',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockUsersService.updateRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'a@b.com', password: 'secret' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if bcrypt.compare returns false', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'a@b.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens on success and calls bcrypt.compare with plain pw and stored hash', async () => {
      const user = { id: 'uid1', email: 'a@b.com', password: 'storedHash' };
      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('accessToken')
        .mockResolvedValueOnce('refreshToken');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'a@b.com',
        password: 'plainPw',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith('plainPw', 'storedHash');
      expect(result).toEqual({
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        userId: 'uid1',
      });
    });
  });

  describe('refresh', () => {
    it('throws UnauthorizedException if user not found', async () => {
      mockUsersService.findByIdWithToken.mockResolvedValue(null);

      await expect(service.refresh('uid1', 'rawToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if user.refreshToken is null (falsy)', async () => {
      mockUsersService.findByIdWithToken.mockResolvedValue({
        id: 'uid1',
        refreshToken: null,
      });

      await expect(service.refresh('uid1', 'rawToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if bcrypt.compare returns false', async () => {
      mockUsersService.findByIdWithToken.mockResolvedValue({
        id: 'uid1',
        refreshToken: 'storedHash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refresh('uid1', 'rawToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns new tokens on success', async () => {
      mockUsersService.findByIdWithToken.mockResolvedValue({
        id: 'uid1',
        email: 'a@b.com',
        refreshToken: 'storedHash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('newAccessToken')
        .mockResolvedValueOnce('newRefreshToken');
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('uid1', 'rawToken');

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
        userId: 'uid1',
      });
    });
  });

  describe('logout', () => {
    it('calls updateRefreshToken with userId and null', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      await service.logout('uid1');

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith(
        'uid1',
        null,
      );
    });
  });
});
