import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

/**
 * Guard funcional que protege rutas requiriendo autenticacion.
 *
 * Verifica la existencia del access token via {@link TokenService}.
 * Redirige a `/auth` si no hay token presente.
 */
export const authGuard: CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  return tokenService.isLoggedIn() ? true : router.createUrlTree(['/auth']);
};
