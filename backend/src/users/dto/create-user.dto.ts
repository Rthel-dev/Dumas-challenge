/** DTO interno para la creacion de usuarios (usado por UsersService). */
export class CreateUserDto {
  /** Nombre completo del usuario. */
  fullName!: string;
  /** Correo electronico del usuario. */
  email!: string;
  /** Contrasena en texto plano (sera hasheada antes de persistir). */
  password!: string;
}
