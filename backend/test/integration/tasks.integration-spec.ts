import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
  createTestApp,
  cleanDatabase,
  closeTestApp,
} from './helpers/test-app.helper';

describe('TasksController (integration)', () => {
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

  const validUser = { email: 'test@example.com', password: 'password123' };
  const otherUser = { email: 'other@example.com', password: 'password123' };
  const validTask = { title: 'Integration Task', dueDate: '2026-06-01' };

  async function registerAndGetToken(
    user = validUser,
  ): Promise<{ accessToken: string; userId: string }> {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);
    return { accessToken: res.body.accessToken, userId: res.body.userId };
  }

  async function createTask(
    accessToken: string,
    task = validTask,
  ): Promise<any> {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(task)
      .expect(201);
    return res.body;
  }

  // ─── POST /tasks ──────────────────────────────────────────────────────

  describe('POST /tasks', () => {
    it('201 -> creates a task and returns it with all fields', async () => {
      const { accessToken, userId } = await registerAndGetToken();

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validTask)
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(validTask.title);
      expect(res.body.completed).toBe(false);
      expect(res.body.userId).toBe(userId);

      // Verify in DB
      const task = await prisma.task.findUnique({
        where: { id: res.body.id },
      });
      expect(task).not.toBeNull();
      expect(task!.title).toBe(validTask.title);
    });

    it('201 -> creates a task with completed=true', async () => {
      const { accessToken } = await registerAndGetToken();

      const res = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ ...validTask, completed: true })
        .expect(201);

      expect(res.body.completed).toBe(true);
    });

    it('400 -> missing title', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dueDate: '2026-06-01' })
        .expect(400);
    });

    it('400 -> missing dueDate', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'No date' })
        .expect(400);
    });

    it('400 -> invalid dueDate format', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Bad', dueDate: 'not-a-date' })
        .expect(400);
    });

    it('401 -> no Authorization header', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send(validTask)
        .expect(401);
    });
  });

  // ─── GET /tasks ───────────────────────────────────────────────────────

  describe('GET /tasks', () => {
    it('200 -> returns empty array when user has no tasks', async () => {
      const { accessToken } = await registerAndGetToken();

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('200 -> returns only tasks belonging to the authenticated user', async () => {
      const user1 = await registerAndGetToken(validUser);
      const user2 = await registerAndGetToken(otherUser);

      await createTask(user1.accessToken, {
        title: 'User1 Task',
        dueDate: '2026-06-01',
      });
      await createTask(user2.accessToken, {
        title: 'User2 Task',
        dueDate: '2026-06-01',
      });

      const res = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('User1 Task');
      expect(res.body[0].userId).toBe(user1.userId);
    });

    it('401 -> no Authorization header', async () => {
      await request(app.getHttpServer()).get('/tasks').expect(401);
    });
  });

  // ─── GET /tasks/:id ───────────────────────────────────────────────────

  describe('GET /tasks/:id', () => {
    it('200 -> returns a single task by id', async () => {
      const { accessToken } = await registerAndGetToken();
      const task = await createTask(accessToken);

      const res = await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe(validTask.title);
    });

    it('404 -> task does not exist', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .get('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('404 -> task belongs to another user', async () => {
      const user1 = await registerAndGetToken(validUser);
      const user2 = await registerAndGetToken(otherUser);
      const task = await createTask(user2.accessToken);

      await request(app.getHttpServer())
        .get(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(404);
    });

    it('401 -> no Authorization header', async () => {
      await request(app.getHttpServer()).get('/tasks/some-id').expect(401);
    });
  });

  // ─── PATCH /tasks/:id ─────────────────────────────────────────────────

  describe('PATCH /tasks/:id', () => {
    it('200 -> updates title only', async () => {
      const { accessToken } = await registerAndGetToken();
      const task = await createTask(accessToken);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.title).toBe('Updated Title');
      expect(res.body.dueDate).toBe(task.dueDate);
    });

    it('200 -> updates completed to true', async () => {
      const { accessToken } = await registerAndGetToken();
      const task = await createTask(accessToken);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ completed: true })
        .expect(200);

      expect(res.body.completed).toBe(true);
    });

    it('200 -> updates multiple fields', async () => {
      const { accessToken } = await registerAndGetToken();
      const task = await createTask(accessToken);

      const res = await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'New', dueDate: '2026-12-25', completed: true })
        .expect(200);

      expect(res.body.title).toBe('New');
      expect(res.body.completed).toBe(true);
    });

    it('404 -> task does not exist', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .patch('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });

    it('404 -> task belongs to another user', async () => {
      const user1 = await registerAndGetToken(validUser);
      const user2 = await registerAndGetToken(otherUser);
      const task = await createTask(user2.accessToken);

      await request(app.getHttpServer())
        .patch(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({ title: 'Hijack' })
        .expect(404);
    });

    it('401 -> no Authorization header', async () => {
      await request(app.getHttpServer())
        .patch('/tasks/some-id')
        .send({ title: 'No auth' })
        .expect(401);
    });
  });

  // ─── DELETE /tasks/:id ────────────────────────────────────────────────

  describe('DELETE /tasks/:id', () => {
    it('200 -> deletes the task and verifies removal from DB', async () => {
      const { accessToken } = await registerAndGetToken();
      const task = await createTask(accessToken);

      const res = await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.id).toBe(task.id);

      // Verify deleted from DB
      const deleted = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deleted).toBeNull();
    });

    it('404 -> task does not exist', async () => {
      const { accessToken } = await registerAndGetToken();

      await request(app.getHttpServer())
        .delete('/tasks/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });

    it('404 -> task belongs to another user', async () => {
      const user1 = await registerAndGetToken(validUser);
      const user2 = await registerAndGetToken(otherUser);
      const task = await createTask(user2.accessToken);

      await request(app.getHttpServer())
        .delete(`/tasks/${task.id}`)
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .expect(404);
    });

    it('401 -> no Authorization header', async () => {
      await request(app.getHttpServer()).delete('/tasks/some-id').expect(401);
    });
  });
});
