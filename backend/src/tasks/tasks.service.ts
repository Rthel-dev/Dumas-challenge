import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/** Servicio de gestion de tareas con operaciones CRUD restringidas por usuario. */
@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crea una nueva tarea asociada al usuario.
   *
   * @param userId - ID del usuario propietario.
   * @param dto - Datos de la tarea a crear.
   * @returns La tarea creada.
   */
  create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        userId,
      },
    });
  }

  /**
   * Obtiene todas las tareas de un usuario, ordenadas por ID descendente.
   *
   * @param userId - ID del usuario propietario.
   * @returns Lista de tareas del usuario.
   */
  findAllByUser(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });
  }

  /**
   * Busca una tarea por ID verificando que pertenezca al usuario.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario propietario.
   * @returns La tarea encontrada.
   * @throws NotFoundException si la tarea no existe o no pertenece al usuario.
   */
  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id, userId },
    });
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }

  /**
   * Actualiza una tarea existente verificando propiedad del usuario.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario propietario.
   * @param dto - Campos a actualizar.
   * @returns La tarea actualizada.
   * @throws NotFoundException si la tarea no existe o no pertenece al usuario.
   */
  async update(id: string, userId: string, dto: UpdateTaskDto) {
    await this.findOne(id, userId);
    const data = dto.dueDate
      ? { ...dto, dueDate: new Date(dto.dueDate) }
      : { ...dto };
    return this.prisma.task.update({
      where: { id },
      data,
    });
  }

  /**
   * Elimina una tarea verificando propiedad del usuario.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario propietario.
   * @returns La tarea eliminada.
   * @throws NotFoundException si la tarea no existe o no pertenece al usuario.
   */
  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.task.delete({ where: { id } });
  }
}
