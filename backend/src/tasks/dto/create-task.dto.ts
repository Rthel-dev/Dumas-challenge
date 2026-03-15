import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO para la creacion de una nueva tarea. */
export class CreateTaskDto {
  /** Titulo de la tarea (obligatorio). */
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title!: string;

  /** Fecha limite en formato ISO 8601 (opcional). */
  @ValidateIf((o) => o.dueDate !== undefined)
  @IsDateString()
  @ApiProperty({ required: false })
  dueDate?: string;

  /** Indica si la tarea esta completada (por defecto `false`). */
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  completed?: boolean;
}
