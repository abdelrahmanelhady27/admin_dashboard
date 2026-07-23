import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('JWT token expired or unauthorized.');
        authService.logout();
        router.navigate(['/login']);
      }

      // Preserve HttpErrorResponse so callers can read err.error.message
      return throwError(() => error);
    })
  );
};
