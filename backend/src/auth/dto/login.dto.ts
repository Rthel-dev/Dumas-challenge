import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO para la solicitud de inicio de sesion. */
export class LoginDto {
  /** Direccion de correo electronico del usuario. */
  @IsEmail({}, { message: 'Dirección email $value no es válida ' })
  @IsString()
  @ApiProperty()
  email!: string;

  /** Contrasena del usuario (minimo 6 caracteres). */
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  @ApiProperty()
  password!: string;
}
