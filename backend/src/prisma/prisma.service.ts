import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';
// import { PrismaClient } from '../../generated/prisma/client';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // opcional: logging
      omit: { user: { password: true, refreshToken: true } }
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
