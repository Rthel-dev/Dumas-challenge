import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: typeof mockPrismaService;

  const userId = 'user-1';
  const taskId = 'task-1';
  const mockTask = {
    id: taskId,
    title: 'Test Task',
    dueDate: new Date('2026-04-01'),
    completed: false,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get(PrismaService);

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task with dueDate converted to Date', async () => {
      const dto = { title: 'Test Task', dueDate: '2026-04-01' };
      prisma.task.create.mockResolvedValue(mockTask);

      const result = await service.create(userId, dto);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { ...dto, dueDate: new Date('2026-04-01'), userId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should create a task with null dueDate when not provided', async () => {
      const dto = { title: 'Test Task' };
      const taskWithoutDate = { ...mockTask, dueDate: null };
      prisma.task.create.mockResolvedValue(taskWithoutDate);

      const result = await service.create(userId, dto);

      expect(prisma.task.create).toHaveBeenCalledWith({
        data: { ...dto, dueDate: null, userId },
      });
      expect(result).toEqual(taskWithoutDate);
    });
  });

  describe('findAllByUser', () => {
    it('should return all tasks for a user', async () => {
      prisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findAllByUser(userId);

      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { id: 'desc' },
      });
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by id and userId', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await service.findOne(taskId, userId);

      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a task without dueDate', async () => {
      const dto = { title: 'Updated' };
      const updated = { ...mockTask, ...dto };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(updated);

      const result = await service.update(taskId, userId, dto);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { ...dto },
      });
      expect(result).toEqual(updated);
    });

    it('should update a task with dueDate converted to Date', async () => {
      const dto = { title: 'Updated', dueDate: '2026-12-25' };
      const updated = { ...mockTask, ...dto, dueDate: new Date('2026-12-25') };
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.update.mockResolvedValue(updated);

      const result = await service.update(taskId, userId, dto);

      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: { ...dto, dueDate: new Date('2026-12-25') },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.update(taskId, userId, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask);
      prisma.task.delete.mockResolvedValue(mockTask);

      const result = await service.remove(taskId, userId);

      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
