import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isAuthEndpoint(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/logout')
  );
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      if (isAuthEndpoint(req.url)) {
        if (req.url.includes('/auth/refresh-token')) {
          authService.clearSession();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      }

      if (!authService.refreshTokenValue) {
        authService.clearSession();
        router.navigate(['/login']);
        return throwError(() => error);
      }

      // Fallback: refresh and retry once (covers edge cases where the
      // access token looked valid client-side but the API rejected it).
      return authService.refreshToken().pipe(
        switchMap((response) =>
          next(
            req.clone({
              setHeaders: { Authorization: `Bearer ${response.token}` }
            })
          )
        ),
        catchError((refreshError) => {
          authService.clearSession();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    })
  );
};
