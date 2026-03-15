import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
} from './helpers/test-app.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    ({ app, prismaService: prisma } = await createTestApp());
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('app initializes and validation pipeline is active', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({})
      .expect(400);
  });
});
