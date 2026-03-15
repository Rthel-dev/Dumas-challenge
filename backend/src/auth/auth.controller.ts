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
import type { CookieOptions, Request, Response } from 'express';
import { GetUser } from './decorators/get-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Controlador de autenticacion que expone endpoints bajo `/auth`.
 *
 * Gestiona el flujo completo: registro, login, refresh de tokens y logout.
 * Los refresh tokens se envian y reciben como cookies HttpOnly.
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Genera las opciones de cookie para el refresh token.
   *
   * @returns Opciones de cookie HttpOnly con `secure` controlado por variable de entorno.
   */
  private refreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('COOKIE_SECURE') === 'true',
      sameSite: 'lax',
      path: '/',
    };
  }

  /**
   * Registra un nuevo usuario.
   * Establece el refresh token como cookie y devuelve el access token.
   *
   * @param dto - Datos de registro validados.
   * @param res - Objeto Response de Express para setear la cookie.
   * @returns Access token y ID del usuario.
   */
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } =
      await this.authService.register(dto);
    res.cookie('dumas_tk', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  /**
   * Inicia sesion con credenciales existentes.
   *
   * @param dto - Credenciales de login validadas.
   * @param res - Objeto Response de Express para setear la cookie.
   * @returns Access token y ID del usuario.
   */
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, userId } =
      await this.authService.login(dto);
    res.cookie('dumas_tk', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  /**
   * Renueva el par de tokens usando el refresh token de la cookie `dumas_tk`.
   *
   * @param req - Objeto Request de Express (contiene la cookie).
   * @param res - Objeto Response de Express para setear la nueva cookie.
   * @returns Nuevo access token y ID del usuario.
   * @throws UnauthorizedException si no hay cookie o el token es invalido.
   */
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken: string | undefined = req.cookies?.['dumas_tk'];
    if (!rawToken) throw new UnauthorizedException('No refresh token provided');

    const payload = await this.jwtService
      .verifyAsync<{ sub: string }>(rawToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      })
      .catch(() => {
        throw new UnauthorizedException('Invalid or expired refresh token');
      });

    const { accessToken, refreshToken, userId } =
      await this.authService.refresh(payload.sub, rawToken);
    res.cookie('dumas_tk', refreshToken, this.refreshCookieOptions());
    return { accessToken, userId };
  }

  /**
   * Cierra la sesion del usuario autenticado.
   * Elimina el refresh token de la BD y limpia la cookie.
   *
   * @param userId - ID del usuario extraido del JWT.
   * @param res - Objeto Response para limpiar la cookie.
   * @returns Mensaje de confirmacion.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(
    @GetUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(userId);
    res.clearCookie('dumas_tk', this.refreshCookieOptions());
    return { message: 'Logged out successfully' };
  }
}
