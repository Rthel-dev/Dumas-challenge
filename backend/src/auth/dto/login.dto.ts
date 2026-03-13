import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail({}, { message: 'Dirección email $value no es válida ' })
  @IsString()
  @ApiProperty()
  email!: string;
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty()
  password!: string;
}
