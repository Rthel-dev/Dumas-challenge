import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title!: string;

  @IsDateString()
  @ApiProperty()
  dueDate!: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  completed?: boolean;
}
