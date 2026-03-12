import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'lax',
      path: '/auth/refresh',
    };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, userId } = await this.authService.register(dto);
    res.cookie('refresh_token', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, userId } = await this.authService.login(dto);
    res.cookie('refresh_token', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken: string | undefined = req.cookies?.['refresh_token'];
    if (!rawToken) throw new UnauthorizedException('No refresh token provided');

    const payload = await this.jwtService.verifyAsync<{ sub: string }>(rawToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
    }).catch(() => {
      throw new UnauthorizedException('Invalid or expired refresh token');
    });

    const { accessToken, refreshToken, userId } = await this.authService.refresh(
      payload.sub,
      rawToken,
    );
    res.cookie('refresh_token', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('refresh_token', this.refreshCookieOptions());
    return { message: 'Logged out successfully' };
  }
}
