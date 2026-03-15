import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/**
 * Controlador de tareas que expone endpoints CRUD bajo `/tasks`.
 * Todas las rutas requieren autenticacion via {@link JwtAuthGuard}.
 */
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Crea una nueva tarea para el usuario autenticado.
   * Endpoint: `POST /tasks`.
   *
   * @param dto - Datos de la tarea validados.
   * @param userId - ID del usuario extraido del JWT.
   * @returns La tarea creada.
   */
  @Post()
  create(@Body() dto: CreateTaskDto, @GetUser('sub') userId: string) {
    return this.tasksService.create(userId, dto);
  }

  /**
   * Lista todas las tareas del usuario autenticado.
   * Endpoint: `GET /tasks`.
   *
   * @param userId - ID del usuario extraido del JWT.
   * @returns Lista de tareas ordenadas por ID descendente.
   */
  @Get()
  findAll(@GetUser('sub') userId: string) {
    return this.tasksService.findAllByUser(userId);
  }

  /**
   * Obtiene una tarea especifica por ID.
   * Endpoint: `GET /tasks/:id`.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario extraido del JWT.
   * @returns La tarea encontrada.
   */
  @Get(':id')
  findOne(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.tasksService.findOne(id, userId);
  }

  /**
   * Actualiza parcialmente una tarea por ID.
   * Endpoint: `PATCH /tasks/:id`.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario extraido del JWT.
   * @param dto - Campos a actualizar.
   * @returns La tarea actualizada.
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetUser('sub') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, userId, dto);
  }

  /**
   * Elimina una tarea por ID.
   * Endpoint: `DELETE /tasks/:id`.
   *
   * @param id - UUID de la tarea.
   * @param userId - ID del usuario extraido del JWT.
   * @returns La tarea eliminada.
   */
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser('sub') userId: string) {
    return this.tasksService.remove(id, userId);
  }
}
