import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
} from './helpers/test-app.helper';

describe('UsersController (e2e)', () => {
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

  const validUser = {
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  async function registerAndGetToken(): Promise<{
    accessToken: string;
    userId: string;
  }> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(validUser);
    return { accessToken: res.body.accessToken, userId: res.body.userId };
  }

  // ─── GET /users/me ──────────────────────────────────────────────────

  describe('GET /users/me', () => {
    it('200 → returns user profile with id, fullName, email', async () => {
      const { accessToken, userId } = await registerAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(userId);
      expect(res.body.fullName).toBe(validUser.fullName);
      expect(res.body.email).toBe(validUser.email);
    });

    it('200 → does not expose password or refreshToken', async () => {
      const { accessToken } = await registerAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('refreshToken');
    });

    it('401 → no Authorization header', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });

    it('401 → invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
