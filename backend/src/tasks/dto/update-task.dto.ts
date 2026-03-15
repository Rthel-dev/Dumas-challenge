import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO para la actualizacion parcial de una tarea.
 * Todos los campos de {@link CreateTaskDto} son opcionales.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
