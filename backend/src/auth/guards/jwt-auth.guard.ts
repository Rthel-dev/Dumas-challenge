import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard que protege rutas verificando el JWT de acceso.
 *
 * Extrae el token del header `Authorization: Bearer <token>`,
 * lo valida contra `JWT_ACCESS_SECRET` y adjunta el payload
 * decodificado en `request['user']`.
 *
 * @throws UnauthorizedException si el header falta o el token es invalido/expirado.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Valida el token JWT del request y autoriza el acceso.
   *
   * @param context - Contexto de ejecucion de NestJS.
   * @returns `true` si el token es valido.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      });
      request['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
