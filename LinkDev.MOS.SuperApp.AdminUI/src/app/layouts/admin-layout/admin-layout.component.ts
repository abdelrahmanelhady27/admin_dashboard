import { Component, HostListener, inject, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { TopbarComponent } from '../../shared/components/topbar/topbar.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { AppLoaderComponent } from '../../shared/components/app-loader/app-loader.component';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, ToastContainerComponent, AppLoaderComponent],
  template: `
    <app-loader [topBar]="true" [fullScreen]="true" [showText]="true" />
    <div class="admin-layout" [class.drawer-open]="sidebarOpen && isDrawerMode">
      <app-sidebar
        [isOpen]="sidebarOpen"
        [collapsed]="sidebarCollapsed && !isDrawerMode"
        [drawerMode]="isDrawerMode"
        (close)="closeSidebar()"
        (toggleCollapse)="sidebarCollapsed = !sidebarCollapsed" />
      <div class="main-content" [class.sidebar-collapsed]="sidebarCollapsed && !isDrawerMode">
        <app-topbar [pageTitle]="pageTitle" [breadcrumb]="breadcrumb" (menuToggle)="toggleSidebar()" />
        <main class="page-content page-enter">
          <router-outlet />
        </main>
      </div>
      <app-toast-container />
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--page-gradient);
    }
    .main-content {
      flex: 1;
      margin-inline-start: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-width: 0;
      max-width: 100%;
      transition: margin-inline-start var(--transition-slow);
    }
    .main-content.sidebar-collapsed {
      margin-inline-start: var(--sidebar-collapsed-width);
    }
    .page-content {
      flex: 1;
      padding: 1.75rem 2rem 2rem;
      max-width: 1440px;
      width: 100%;
      min-width: 0;
    }
    @media (max-width: 1199px) {
      .page-content { padding: 1.5rem 1.75rem 1.75rem; }
    }
    @media (max-width: 991px) {
      .page-content { padding: 1.25rem 1rem 1.5rem; }
    }
    @media (max-width: 767px) {
      .main-content,
      .main-content.sidebar-collapsed { margin-inline-start: 0; }
      .page-content { padding: 1rem 0.875rem 1.25rem; }
    }
    @media (max-width: 479px) {
      .page-content { padding: 0.875rem 0.75rem 1rem; }
    }
  `]
})
export class AdminLayoutComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);

  sidebarOpen = false;
  sidebarCollapsed = false;
  isDrawerMode = false;
  pageTitle = 'nav.dashboard';
  breadcrumb = 'nav.dashboard';

  private readonly routeTitleMap: Record<string, string> = {
    '/dashboard': 'nav.dashboard',
    '/users': 'nav.users',
    '/users/create': 'users.createTitle',
    '/service-pages': 'nav.servicePages',
    '/service-pages/create': 'servicePages.createTitle',
    '/quick-links': 'nav.quickLinks',
    '/employee-news': 'nav.employeeNews',
    '/employee-news/create': 'news.createTitle',
    '/employee-news/categories': 'news.manageCategories',
    '/employee-news/categories/create': 'news.createCategory',
    '/employee-news/emojis': 'news.manageEmojis',
    '/employee-news/emojis/create': 'news.createEmoji',
    '/audit-log': 'nav.auditLog',
    '/settings': 'nav.settings'
  };

  constructor() {
    this.updateDrawerMode();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loader.startNavigation();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loader.completeNavigation();
        if (event instanceof NavigationEnd) {
          const url = event.urlAfterRedirects.split('?')[0];
          this.pageTitle = this.resolveTitle(url);
          this.breadcrumb = this.pageTitle;
          this.closeSidebar();
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateDrawerMode();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    this.syncBodyScroll();
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    this.syncBodyScroll();
  }

  private updateDrawerMode(): void {
    if (typeof window === 'undefined') return;
    const drawer = window.matchMedia('(max-width: 767px)').matches;
    this.isDrawerMode = drawer;
    if (drawer) {
      this.sidebarCollapsed = false;
    } else {
      this.sidebarOpen = false;
    }
    this.syncBodyScroll();
  }

  private syncBodyScroll(): void {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('no-scroll', this.sidebarOpen && this.isDrawerMode);
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('no-scroll');
    }
  }

  private resolveTitle(url: string): string {
    if (this.routeTitleMap[url]) return this.routeTitleMap[url];
    if (url.match(/\/users\/[^/]+\/edit/)) return 'users.editTitle';
    if (url.match(/\/users\/[^/]+/)) return 'users.detailsTitle';
    if (url.match(/\/service-pages\/[^/]+\/edit/)) return 'servicePages.editTitle';
    if (url.match(/\/service-pages\/[^/]+/)) return 'servicePages.detailsTitle';
    if (url.match(/\/employee-news\/categories\/[^/]+\/edit/)) return 'news.editCategory';
    if (url.match(/\/employee-news\/categories\/[^/]+/)) return 'news.categoryDetailsTitle';
    if (url.match(/\/employee-news\/emojis\/[^/]+\/edit/)) return 'news.editEmoji';
    if (url.match(/\/employee-news\/emojis\/[^/]+/)) return 'news.emojiDetailsTitle';
    if (url.match(/\/employee-news\/[^/]+\/edit/)) return 'news.editTitle';
    if (url.match(/\/employee-news\/[^/]+/)) return 'news.detailsTitle';
    return 'nav.dashboard';
  }
}
