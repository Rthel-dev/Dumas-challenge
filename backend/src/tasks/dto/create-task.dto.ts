import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title!: string;

  @ValidateIf((o) => o.dueDate !== undefined)
  @IsDateString()
  @ApiProperty({ required: false })
  dueDate?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false, default: false })
  completed?: boolean;
}
