import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ContentType } from '../models/enums';
import { AuthService } from '../services/auth.service';

export function permissionGuard(contentType: ContentType, action: 'view' | 'create' | 'edit' | 'delete' | 'publish'): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      return router.createUrlTree(['/login']);
    }

    return auth.hasPermission(contentType, action)
      ? true
      : router.createUrlTree(['/login']);
  };
}
