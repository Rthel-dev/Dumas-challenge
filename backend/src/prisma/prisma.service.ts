import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';
// import { PrismaClient } from '../../generated/prisma/client';
import { PrismaClient } from '@prisma/client';

/**
 * Servicio que encapsula la conexion a PostgreSQL mediante Prisma.
 *
 * Configura logging de queries y omision automatica de campos
 * sensibles (password, refreshToken) en consultas de usuario.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // opcional: logging
      omit: { user: { password: true, refreshToken: true } },
    });
  }

  /** Establece la conexion a la base de datos al iniciar el modulo. */
  async onModuleInit() {
    await this.$connect();
  }

  /** Cierra la conexion a la base de datos al destruir el modulo. */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
