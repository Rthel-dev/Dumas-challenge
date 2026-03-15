import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

const mockTasksService = {
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const mockJwtService = { verifyAsync: jest.fn() };
const mockConfigService = { get: jest.fn() };

describe('TasksController', () => {
  let controller: TasksController;

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
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: mockTasksService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call tasksService.create with userId and dto, and return the result', async () => {
      const dto = { title: 'Test Task', dueDate: '2026-04-01' };
      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(dto, userId);

      expect(mockTasksService.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should call tasksService.findAllByUser with userId and return array', async () => {
      mockTasksService.findAllByUser.mockResolvedValue([mockTask]);

      const result = await controller.findAll(userId);

      expect(mockTasksService.findAllByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should call tasksService.findOne with id and userId and return the task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(taskId, userId);

      expect(mockTasksService.findOne).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(mockTask);
    });

    it('should propagate NotFoundException from service', async () => {
      mockTasksService.findOne.mockRejectedValue(
        new NotFoundException(`Task with id "${taskId}" not found`),
      );

      await expect(controller.findOne(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should call tasksService.update with id, userId, and dto, return updated task', async () => {
      const dto = { title: 'Updated' };
      const updated = { ...mockTask, ...dto };
      mockTasksService.update.mockResolvedValue(updated);

      const result = await controller.update(taskId, userId, dto);

      expect(mockTasksService.update).toHaveBeenCalledWith(taskId, userId, dto);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException from service', async () => {
      mockTasksService.update.mockRejectedValue(
        new NotFoundException(`Task with id "${taskId}" not found`),
      );

      await expect(
        controller.update(taskId, userId, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call tasksService.remove with id and userId and return result', async () => {
      mockTasksService.remove.mockResolvedValue(mockTask);

      const result = await controller.remove(taskId, userId);

      expect(mockTasksService.remove).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(mockTask);
    });

    it('should propagate NotFoundException from service', async () => {
      mockTasksService.remove.mockRejectedValue(
        new NotFoundException(`Task with id "${taskId}" not found`),
      );

      await expect(controller.remove(taskId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
