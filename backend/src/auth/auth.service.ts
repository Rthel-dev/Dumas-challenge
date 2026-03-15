import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * Servicio de autenticacion que gestiona registro, login, refresh y logout.
 *
 * Utiliza JWT con rotacion de refresh tokens almacenados como hash bcrypt.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Registra un nuevo usuario y genera par de tokens.
   *
   * @param dto - Datos de registro (nombre, email, contrasena).
   * @returns Access token, refresh token y ID del usuario creado.
   */
  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  /**
   * Autentica un usuario existente con email y contrasena.
   *
   * @param dto - Credenciales de inicio de sesion.
   * @returns Access token, refresh token y ID del usuario.
   * @throws UnauthorizedException si las credenciales son invalidas.
   */
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  /**
   * Rota el par de tokens usando un refresh token valido.
   *
   * Compara el token recibido contra el hash almacenado en BD
   * y emite nuevos tokens si coincide.
   *
   * @param userId - ID del usuario extraido del payload del refresh token.
   * @param rawRefreshToken - Refresh token sin hashear recibido de la cookie.
   * @returns Nuevo par de tokens y ID del usuario.
   * @throws UnauthorizedException si el token no coincide o el usuario no existe.
   */
  async refresh(userId: string, rawRefreshToken: string) {
    const user = await this.usersService.findByIdWithToken(userId);
    if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

    const tokenMatch = await bcrypt.compare(rawRefreshToken, user.refreshToken);
    if (!tokenMatch) throw new UnauthorizedException('Access denied');

    const { accessToken, refreshToken } = await this.generateTokens(
      user.id,
      user.email,
    );
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, userId: user.id };
  }

  /**
   * Cierra la sesion del usuario eliminando su refresh token de la BD.
   *
   * @param userId - ID del usuario que cierra sesion.
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  /**
   * Genera un par de tokens JWT (acceso y refresh) firmados con sus respectivos secretos.
   *
   * @param userId - ID del usuario para el claim `sub`.
   * @param email - Email del usuario para el claim `email`.
   * @returns Objeto con `accessToken` y `refreshToken`.
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') as any,
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
