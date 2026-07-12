import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { AuthService } from './core/services/auth.service';
import { ContentType } from './core/models/enums';

function getRouteFromContentType(type: string): string {
  switch (type) {
    case 'ServiceIntroPage': return 'service-pages';
    case 'QuickLinks': return 'quick-links';
    case 'EmployeeNews': return 'employee-news';
    case 'AuditLog': return 'audit-log';
    default: return 'settings';
  }
}

const dashboardGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isSuperAdmin) {
    return true;
  }
  const firstPerm = auth.permissions.find(p => p.canView);
  if (firstPerm) {
    const route = getRouteFromContentType(firstPerm.contentType ?? firstPerm.feature ?? '');
    return router.createUrlTree([`/${route}`]);
  }
  return router.createUrlTree(['/settings']);
};

const superAdminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isSuperAdmin ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [dashboardGuard],
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'users',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/users/users-list/users-list.component').then((m) => m.UsersListComponent)
      },
      {
        path: 'users/create',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/users/user-create/user-create.component').then((m) => m.UserCreateComponent)
      },
      {
        path: 'users/:id',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/users/user-details/user-details.component').then((m) => m.UserDetailsComponent)
      },
      {
        path: 'users/:id/edit',
        canActivate: [superAdminGuard],
        loadComponent: () => import('./features/users/user-edit/user-edit.component').then((m) => m.UserEditComponent)
      },
      {
        path: 'service-pages',
        canActivate: [permissionGuard(ContentType.ServiceIntroPage, 'view')],
        loadComponent: () => import('./features/service-pages/service-pages-list/service-pages-list.component').then((m) => m.ServicePagesListComponent)
      },
      {
        path: 'service-pages/create',
        canActivate: [permissionGuard(ContentType.ServiceIntroPage, 'create')],
        loadComponent: () => import('./features/service-pages/service-page-create/service-page-create.component').then((m) => m.ServicePageCreateComponent)
      },
      {
        path: 'service-pages/:id',
        canActivate: [permissionGuard(ContentType.ServiceIntroPage, 'view')],
        loadComponent: () => import('./features/service-pages/service-page-details/service-page-details.component').then((m) => m.ServicePageDetailsComponent)
      },
      {
        path: 'service-pages/:id/edit',
        canActivate: [permissionGuard(ContentType.ServiceIntroPage, 'edit')],
        loadComponent: () => import('./features/service-pages/service-page-edit/service-page-edit.component').then((m) => m.ServicePageEditComponent)
      },
      {
        path: 'quick-links',
        canActivate: [permissionGuard(ContentType.QuickLinks, 'view')],
        loadComponent: () => import('./features/quick-links/quick-links-manage/quick-links-manage.component').then((m) => m.QuickLinksManageComponent)
      },
      {
        path: 'employee-news',
        canActivate: [permissionGuard(ContentType.EmployeeNews, 'view')],
        loadComponent: () => import('./features/employee-news/news-list/news-list.component').then((m) => m.NewsListComponent)
      },
      {
        path: 'employee-news/create',
        canActivate: [permissionGuard(ContentType.EmployeeNews, 'create')],
        loadComponent: () => import('./features/employee-news/news-create/news-create.component').then((m) => m.NewsCreateComponent)
      },
      {
        path: 'employee-news/:id',
        canActivate: [permissionGuard(ContentType.EmployeeNews, 'view')],
        loadComponent: () => import('./features/employee-news/news-details/news-details.component').then((m) => m.NewsDetailsComponent)
      },
      {
        path: 'employee-news/:id/edit',
        canActivate: [permissionGuard(ContentType.EmployeeNews, 'edit')],
        loadComponent: () => import('./features/employee-news/news-edit/news-edit.component').then((m) => m.NewsEditComponent)
      },
      {
        path: 'audit-log',
        canActivate: [permissionGuard(ContentType.AuditLog, 'view')],
        loadComponent: () => import('./features/audit-log/audit-log.component').then((m) => m.AuditLogComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
