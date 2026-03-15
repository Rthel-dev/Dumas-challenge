import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO para la solicitud de registro de un nuevo usuario. */
export class RegisterDto {
  /** Nombre completo del usuario. */
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  fullName!: string;

  /** Direccion de correo electronico (debe ser unica). */
  @IsEmail()
  @ApiProperty()
  email!: string;

  /** Contrasena del usuario (minimo 6 caracteres). */
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty()
  password!: string;
}
