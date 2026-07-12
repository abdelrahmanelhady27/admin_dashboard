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

    if (auth.isSuperAdmin) {
      return true;
    }

    const perm = auth.permissions.find((p) => (p.contentType ?? p.feature) === contentType);
    if (!perm) {
      return router.createUrlTree(['/login']);
    }

    const allowed =
      (action === 'view' && perm.canView) ||
      (action === 'create' && perm.canCreate) ||
      (action === 'edit' && perm.canEdit) ||
      (action === 'delete' && perm.canDelete) ||
      (action === 'publish' && perm.canPublish);

    return allowed ? true : router.createUrlTree(['/login']);
  };
}
