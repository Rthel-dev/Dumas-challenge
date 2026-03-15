import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorador de parametro que extrae el usuario autenticado del request.
 *
 * @param key - Propiedad del payload JWT a extraer (ej. `'sub'` para el ID).
 *              Si se omite, devuelve el payload completo.
 *
 * @example
 * getProfile(@GetUser('sub') userId: string)
 */
export const GetUser = createParamDecorator(
  (key: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request['user'];
    return key ? user?.[key] : user;
  },
);
