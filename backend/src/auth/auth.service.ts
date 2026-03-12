import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  async refresh(userId: string, rawRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Access denied');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
