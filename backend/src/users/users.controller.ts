import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

/** Controlador de usuarios que expone endpoints bajo `/users`. */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene el perfil del usuario autenticado.
   * Endpoint: `GET /users/me`. Requiere autenticacion.
   *
   * @param userId - ID del usuario extraido del JWT.
   * @returns Perfil del usuario (id, nombre, email).
   * @throws NotFoundException si el usuario no existe.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@GetUser('sub') userId: string) {
    const user = await this.usersService.getProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
