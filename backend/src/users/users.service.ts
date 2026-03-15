import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

/** Servicio de gestion de usuarios con operaciones CRUD y manejo de refresh tokens. */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea un nuevo usuario con la contrasena hasheada.
   *
   * @param dto - Datos del nuevo usuario.
   * @returns El usuario creado (sin campos sensibles gracias a la config de Prisma).
   * @throws ConflictException si el email ya esta registrado.
   */
  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { fullName: dto.fullName, email: dto.email, password: hashed },
    });
  }

  /**
   * Busca un usuario por email incluyendo el hash de su contrasena.
   * Usado internamente para validacion de credenciales en login.
   *
   * @param email - Email a buscar.
   * @returns Usuario con id, email y password, o `null` si no existe.
   */
  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });
  }

  /**
   * Busca un usuario por ID.
   *
   * @param id - UUID del usuario.
   * @returns El usuario encontrado o `null`.
   */
  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  /**
   * Busca un usuario por ID incluyendo el refresh token hasheado.
   * Usado exclusivamente en el flujo de refresh de tokens.
   *
   * @param id - UUID del usuario.
   * @returns Usuario con id, email y refreshToken, o `null` si no existe.
   */
  findByIdWithToken(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, refreshToken: true },
    });
  }

  /**
   * Obtiene el perfil publico de un usuario (sin datos sensibles).
   *
   * @param id - UUID del usuario.
   * @returns Objeto con id, fullName y email.
   */
  getProfile(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, email: true },
    });
  }

  /**
   * Actualiza el refresh token hasheado del usuario en la BD.
   * Pasar `null` elimina el token (usado en logout).
   *
   * @param userId - UUID del usuario.
   * @param token - Refresh token en texto plano a hashear, o `null` para eliminar.
   */
  async updateRefreshToken(userId: string, token: string | null) {
    const hashed = token ? await bcrypt.hash(token, 12) : null;
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    });
  }
}
