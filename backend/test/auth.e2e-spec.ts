import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
} from './helpers/test-app.helper';

describe('AuthController (e2e)', () => {
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

  // ─── POST /auth/register ────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('201 → returns accessToken, userId, sets dumas_tk cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('userId');
      expect(typeof res.body.accessToken).toBe('string');
      expect(typeof res.body.userId).toBe('string');

      const cookies: string[] = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('dumas_tk='))).toBe(
        true,
      );

      // Verify user exists in DB
      const user = await prisma.user.findUnique({
        where: { email: validUser.email },
        select: { id: true, email: true, refreshToken: true },
      });
      expect(user).not.toBeNull();
      expect(user!.email).toBe(validUser.email);
      expect(user!.refreshToken).not.toBeNull();
    });

    it('400 → invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: 'Test', email: 'not-an-email', password: 'password123' })
        .expect(400);
    });

    it('400 → missing password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: 'Test', email: 'test@example.com' })
        .expect(400);
    });

    it('400 → password shorter than 6 characters', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ fullName: 'Test', email: 'test@example.com', password: '12345' })
        .expect(400);
    });

    it('400 → missing fullName', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(400);
    });

    it('409 → duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser)
        .expect(409);
    });
  });

  // ─── POST /auth/login ───────────────────────────────────────────────

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(validUser);
    });

    it('200 → returns accessToken, userId, sets dumas_tk cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: validUser.email, password: validUser.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('userId');

      const cookies: string[] = res.headers['set-cookie'];
      expect(cookies.some((c: string) => c.startsWith('dumas_tk='))).toBe(
        true,
      );

      // Verify refreshToken updated in DB
      const user = await prisma.user.findUnique({
        where: { email: validUser.email },
        select: { refreshToken: true },
      });
      expect(user!.refreshToken).not.toBeNull();
    });

    it('400 → invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'bad-email', password: 'password123' })
        .expect(400);
    });

    it('400 → missing fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('401 → user not found', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });

    it('401 → wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: validUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  // ─── POST /auth/refresh ─────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    let refreshCookie: string;
    let userId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser);
      userId = res.body.userId;

      const cookies: string[] = res.headers['set-cookie'];
      refreshCookie = cookies.find((c: string) =>
        c.startsWith('dumas_tk='),
      )!;
    });

    it('200 → returns new accessToken, userId, rotates cookie and DB token', async () => {
      // Get the old refresh token hash from DB
      const before = await prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('userId');
      expect(res.body.userId).toBe(userId);

      const newCookies: string[] = res.headers['set-cookie'];
      expect(
        newCookies.some((c: string) => c.startsWith('dumas_tk=')),
      ).toBe(true);

      // Verify refreshToken rotated in DB
      const after = await prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });
      expect(after!.refreshToken).not.toBeNull();
      expect(after!.refreshToken).not.toBe(before!.refreshToken);
    });

    it('401 → no cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('401 → invalid JWT in cookie', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', 'dumas_tk=invalid.jwt.token')
        .expect(401);
    });
  });

  // ─── POST /auth/logout ──────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let userId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validUser);
      accessToken = res.body.accessToken;
      userId = res.body.userId;
    });

    it('200 → returns message, clears cookie, nulls refreshToken in DB', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual({ message: 'Logged out successfully' });

      // Verify cookie cleared
      const cookies: string[] = res.headers['set-cookie'];
      expect(cookies.some((c: string) => c.includes('dumas_tk=;'))).toBe(
        true,
      );

      // Verify refreshToken null in DB
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { refreshToken: true },
      });
      expect(user!.refreshToken).toBeNull();
    });

    it('401 → no Authorization header', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });

    it('401 → invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});
