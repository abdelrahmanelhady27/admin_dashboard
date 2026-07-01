import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users-list/users-list.component').then((m) => m.UsersListComponent)
      },
      {
        path: 'users/create',
        loadComponent: () => import('./features/users/user-create/user-create.component').then((m) => m.UserCreateComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/users/user-details/user-details.component').then((m) => m.UserDetailsComponent)
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/users/user-edit/user-edit.component').then((m) => m.UserEditComponent)
      },
      {
        path: 'service-pages',
        loadComponent: () => import('./features/service-pages/service-pages-list/service-pages-list.component').then((m) => m.ServicePagesListComponent)
      },
      {
        path: 'service-pages/create',
        loadComponent: () => import('./features/service-pages/service-page-create/service-page-create.component').then((m) => m.ServicePageCreateComponent)
      },
      {
        path: 'service-pages/:id',
        loadComponent: () => import('./features/service-pages/service-page-details/service-page-details.component').then((m) => m.ServicePageDetailsComponent)
      },
      {
        path: 'service-pages/:id/edit',
        loadComponent: () => import('./features/service-pages/service-page-edit/service-page-edit.component').then((m) => m.ServicePageEditComponent)
      },
      {
        path: 'quick-links',
        loadComponent: () => import('./features/quick-links/quick-links-manage/quick-links-manage.component').then((m) => m.QuickLinksManageComponent)
      },
      {
        path: 'employee-news',
        loadComponent: () => import('./features/employee-news/news-list/news-list.component').then((m) => m.NewsListComponent)
      },
      {
        path: 'employee-news/create',
        loadComponent: () => import('./features/employee-news/news-create/news-create.component').then((m) => m.NewsCreateComponent)
      },
      {
        path: 'employee-news/:id',
        loadComponent: () => import('./features/employee-news/news-details/news-details.component').then((m) => m.NewsDetailsComponent)
      },
      {
        path: 'employee-news/:id/edit',
        loadComponent: () => import('./features/employee-news/news-edit/news-edit.component').then((m) => m.NewsEditComponent)
      },
      {
        path: 'audit-log',
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
