import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'Dirección email $value no es válida ' })
  @IsString()
  email!: string;
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password!: string;
}
