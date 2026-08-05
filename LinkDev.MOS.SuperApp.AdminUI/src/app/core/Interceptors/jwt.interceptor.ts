import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

function isAuthTokenUrl(url: string): boolean {
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/logout')
  );
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  if (isAuthTokenUrl(req.url)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);

  // Access token already expired → refresh first, then send the request
  // with the new token (do not wait for a 401).
  if (authService.isAccessTokenExpired && authService.refreshTokenValue) {
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
  }

  const token = authService.token;
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
