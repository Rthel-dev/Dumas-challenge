import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  getProfile: jest.fn(),
};

const mockJwtService = { verifyAsync: jest.fn() };
const mockConfigService = { get: jest.fn() };

describe('UsersController', () => {
  let controller: UsersController;

  const userId = 'user-1';
  const mockProfile = {
    id: userId,
    fullName: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      mockUsersService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(userId);

      expect(mockUsersService.getProfile).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.getProfile.mockResolvedValue(null);

      await expect(controller.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
