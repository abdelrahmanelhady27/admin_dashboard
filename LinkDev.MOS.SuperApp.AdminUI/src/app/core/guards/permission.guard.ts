import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ContentType } from '../models/enums';
import { UsersService } from '../services/users.service';
import { MockAuthService } from '../services/mock-auth.service';

export function permissionGuard(contentType: ContentType, action: 'view' | 'create' | 'edit' | 'delete' | 'publish'): CanActivateFn {
  return () => {
    const auth = inject(MockAuthService);
    const users = inject(UsersService);
    const router = inject(Router);

    if (!auth.isAuthenticated) {
      return router.createUrlTree(['/login']);
    }

    // Mock admin bypass for template
    if (auth.currentUser?.isAdmin) {
      return true;
    }

    const email = auth.currentUser?.email;
    const dashboardUser = users.getAll().find((u) => u.email === email);
    if (!dashboardUser || dashboardUser.status === 'Suspended') {
      return router.createUrlTree(['/dashboard']);
    }

    const perm = dashboardUser.permissions.find((p) => p.contentType === contentType);
    if (!perm) {
      return router.createUrlTree(['/dashboard']);
    }

    const allowed =
      (action === 'view' && perm.canView) ||
      (action === 'create' && perm.canCreate) ||
      (action === 'edit' && perm.canEdit) ||
      (action === 'delete' && perm.canDelete) ||
      (action === 'publish' && perm.canPublish);

    return allowed ? true : router.createUrlTree(['/dashboard']);
  };
}
