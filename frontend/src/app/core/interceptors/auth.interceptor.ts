import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, finalize, shareReplay, switchMap, throwError, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

/**
 * Observable compartido para evitar multiples refresh simultaneos.
 * Se asigna durante un refresh en curso y se limpia al completarse.
 */
let refreshInProgress$: Observable<string> | null = null;

/**
 * Interceptor HTTP que adjunta el access token a las solicitudes
 * y gestiona la renovacion automatica ante errores 401.
 *
 * Comportamiento:
 * 1. Agrega `withCredentials: true` a todas las solicitudes.
 * 2. Adjunta el header `Authorization: Bearer <token>` si hay token.
 * 3. Ante un 401 en un endpoint protegido, intenta renovar el token.
 * 4. Si el refresh falla, cierra la sesion del usuario.
 * 5. Evita refresh concurrentes compartiendo un unico Observable.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);

  const isAuthEndpoint = req.url.includes('/auth/');

  const reqWithCreds = req.clone({ withCredentials: true });
  const token = tokenService.get();

  const authReq =
    token && !isAuthEndpoint
      ? reqWithCreds.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : reqWithCreds;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isAuthEndpoint) {
        if (!refreshInProgress$) {
          refreshInProgress$ = authService.refresh().pipe(
            shareReplay(1),
            finalize(() => (refreshInProgress$ = null)),
          );
        }

        return refreshInProgress$.pipe(
          switchMap((newToken) =>
            next(
              req.clone({
                withCredentials: true,
                setHeaders: { Authorization: `Bearer ${newToken}` },
              }),
            ),
          ),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
