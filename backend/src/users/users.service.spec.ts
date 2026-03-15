import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('hashes the password with salt 12 and creates the user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPw');

      const result = await service.create({
        fullName: 'Test User',
        email: 'a@b.com',
        password: 'secret',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 12);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: { fullName: 'Test User', email: 'a@b.com', password: 'hashedPw' },
      });
      expect(result).toEqual({ id: '1', email: 'a@b.com' });
    });

    it('throws ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
      });

      await expect(
        service.create({
          fullName: 'Test User',
          email: 'a@b.com',
          password: 'secret',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('does NOT call create if email is taken', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'a@b.com',
      });

      await expect(
        service.create({
          fullName: 'Test User',
          email: 'a@b.com',
          password: 'secret',
        }),
      ).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      const user = { id: '1', email: 'a@b.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByEmail('a@b.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'a@b.com' },
        select: { id: true, email: true, password: true },
      });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('missing@b.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns the user when found', async () => {
      const user = { id: '1', email: 'a@b.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findById('missing');

      expect(result).toBeNull();
    });
  });

  describe('findByIdWithToken', () => {
    it('returns the user with refreshToken when found', async () => {
      const user = { id: '1', email: 'a@b.com', refreshToken: 'hashedToken' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findByIdWithToken('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, email: true, refreshToken: true },
      });
      expect(result).toEqual(user);
    });

    it('returns null when not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByIdWithToken('missing');

      expect(result).toBeNull();
    });
  });

  describe('getProfile', () => {
    it('returns id, fullName, and email for the user', async () => {
      const profile = { id: '1', fullName: 'Test User', email: 'a@b.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: { id: true, fullName: true, email: true },
      });
      expect(result).toEqual(profile);
    });

    it('returns null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('missing');

      expect(result).toBeNull();
    });
  });

  describe('updateRefreshToken', () => {
    it('hashes the token and calls user.update when token is a string', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');
      mockPrismaService.user.update.mockResolvedValue({});

      await service.updateRefreshToken('1', 'rawToken');

      expect(bcrypt.hash).toHaveBeenCalledWith('rawToken', 12);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: 'hashedToken' },
      });
    });

    it('stores null directly when token is null (does NOT call bcrypt.hash)', async () => {
      mockPrismaService.user.update.mockResolvedValue({});

      await service.updateRefreshToken('1', null);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { refreshToken: null },
      });
    });
  });
});
