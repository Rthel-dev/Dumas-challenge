import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

const mockJwtService = {
  verifyAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

function buildContext(headers: Record<string, string>) {
  const request = { headers };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  } as any;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue('access-secret');
  });

  it('returns true and sets request["user"] on valid Bearer token', async () => {
    const payload = { sub: 'uid1', email: 'a@b.com' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    const ctx = buildContext({ authorization: 'Bearer validToken' });

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(ctx.request['user']).toEqual(payload);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('validToken', { secret: 'access-secret' });
  });

  it('throws UnauthorizedException with correct message when no Authorization header', async () => {
    const ctx = buildContext({});

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Missing or invalid Authorization header'),
    );
  });

  it('throws UnauthorizedException when header does not start with "Bearer "', async () => {
    const ctx = buildContext({ authorization: 'Basic sometoken' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Missing or invalid Authorization header'),
    );
  });

  it('throws UnauthorizedException when verifyAsync rejects', async () => {
    mockJwtService.verifyAsync.mockRejectedValue(new Error('expired'));
    const ctx = buildContext({ authorization: 'Bearer expiredToken' });

    await expect(guard.canActivate(ctx)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired access token'),
    );
  });

  it('extracts token by slicing 7 characters after "Bearer "', async () => {
    const payload = { sub: 'uid1' };
    mockJwtService.verifyAsync.mockResolvedValue(payload);
    const ctx = buildContext({ authorization: 'Bearer mytoken123' });

    await guard.canActivate(ctx);

    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('mytoken123', expect.any(Object));
  });
});
