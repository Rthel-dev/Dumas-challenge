import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, finalize, shareReplay, switchMap, throwError, Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

let refreshInProgress$: Observable<string> | null = null;

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
