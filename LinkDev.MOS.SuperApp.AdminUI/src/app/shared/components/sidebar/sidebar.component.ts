import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { ContentType } from '../../../core/models/enums';
import { PermissionSet } from '../../../core/models/permission.model';

interface NavItem {
  route: string;
  labelKey: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    @if (drawerMode && isOpen) {
      <div
        class="sidebar-overlay"
        (click)="close.emit()"
        aria-hidden="true"
      ></div>
    }

    <aside
      class="sidebar"
      [class.open]="isOpen"
      [class.collapsed]="collapsed"
      [class.drawer]="drawerMode"
      [class.mobile-sidebar]="drawerMode"
      [class.sidebar--rtl]="drawerMode && isRtl"
      [class.sidebar--ltr]="drawerMode && !isRtl"
      [attr.aria-hidden]="drawerMode && !isOpen"
    >
      <div class="sidebar-header">
        <img src="assets/images/logo.svg" alt="Logo" class="logo" />
        @if (!collapsed) {
          <div class="brand">
            <span class="brand-title">{{ 'app.title' | translate }}</span>
            <span class="brand-sub">{{ 'app.titleAr' | translate }}</span>
          </div>
        }
        @if (drawerMode) {
          <button
            type="button"
            class="close-btn"
            (click)="close.emit()"
            aria-label="Close"
          >
            ✕
          </button>
        }
      </div>
      <nav class="sidebar-nav">
        @for (item of filteredNavItems; track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            (click)="close.emit()"
          >
            <span class="nav-icon">{{ icons[item.route] }}</span>
            @if (!collapsed) {
              <span class="nav-label">{{ item.labelKey | translate }}</span>
            }
            <span class="active-indicator"></span>
          </a>
        }
      </nav>
      @if (!drawerMode) {
        <div class="sidebar-footer">
          @if (!collapsed) {
            <button
              type="button"
              class="collapse-btn"
              (click)="toggleCollapse.emit()"
            >
              ◀ {{ 'sidebar.collapse' | translate }}
            </button>
            <span class="version">v1.0.0</span>
          } @else {
            <button
              type="button"
              class="collapse-btn"
              (click)="toggleCollapse.emit()"
            >
              ▶
            </button>
          }
        </div>
      } @else {
        <div class="sidebar-footer sidebar-footer--drawer">
          <span class="version">v1.0.0</span>
        </div>
      }
    </aside>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 0;
        inset-inline-start: 0;
        width: var(--sidebar-width);
        height: 100dvh;
        background: var(--card-bg);
        border-inline-end: 1px solid var(--border-light);
        z-index: 200;
        display: flex;
        flex-direction: column;
        transition:
          transform var(--transition-slow),
          width var(--transition-slow),
          visibility var(--transition-slow);
        box-shadow: var(--shadow-sm);
      }
      .sidebar.collapsed:not(.drawer) {
        width: var(--sidebar-collapsed-width);
      }

      /* Mobile off-canvas drawer */
      .sidebar.drawer,
      .sidebar.mobile-sidebar {
        inset-inline-start: auto;
        width: min(82vw, 320px);
        max-width: 320px;
        min-width: 260px;
        z-index: 999;
        will-change: transform;
      }
      .sidebar.drawer:not(.open),
      .sidebar.mobile-sidebar:not(.open) {
        pointer-events: none;
        visibility: hidden;
      }
      .sidebar.drawer.open,
      .sidebar.mobile-sidebar.open {
        pointer-events: auto;
        visibility: visible;
      }

      /* LTR: slide from left */
      .sidebar.drawer.sidebar--ltr,
      .sidebar.mobile-sidebar.sidebar--ltr {
        left: 0;
        right: auto;
      }
      .sidebar.drawer.sidebar--ltr:not(.open),
      .sidebar.mobile-sidebar.sidebar--ltr:not(.open) {
        transform: translateX(-100%);
      }
      .sidebar.drawer.sidebar--ltr.open,
      .sidebar.mobile-sidebar.sidebar--ltr.open {
        transform: translateX(0);
      }

      /* RTL: slide from right */
      .sidebar.drawer.sidebar--rtl,
      .sidebar.mobile-sidebar.sidebar--rtl {
        right: 0;
        left: auto;
      }
      .sidebar.drawer.sidebar--rtl:not(.open),
      .sidebar.mobile-sidebar.sidebar--rtl:not(.open) {
        transform: translateX(100%);
      }
      .sidebar.drawer.sidebar--rtl.open,
      .sidebar.mobile-sidebar.sidebar--rtl.open {
        transform: translateX(0);
      }

      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        z-index: 998;
        animation: fadeIn 0.2s ease;
      }

      .sidebar-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border-bottom: 1px solid var(--border-light);
        min-height: var(--topbar-height);
        flex-shrink: 0;
      }
      .logo {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
      }
      .brand {
        flex: 1;
        min-width: 0;
      }
      .brand-title {
        display: block;
        font-weight: 700;
        font-size: 0.8125rem;
        color: var(--text-dark);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .brand-sub {
        display: block;
        font-size: 0.6875rem;
        color: var(--text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: var(--page-bg);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-sm);
        cursor: pointer;
        color: var(--text-muted);
        font-size: 1rem;
        flex-shrink: 0;
        transition: all var(--transition-fast);
      }
      .close-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .sidebar-nav {
        flex: 1;
        padding: 0.875rem 0.625rem;
        display: flex;
        flex-direction: column;
        gap: 0.1875rem;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      .sidebar-nav a {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6875rem 0.875rem;
        border-radius: var(--radius-md);
        color: var(--text-muted);
        text-decoration: none;
        font-size: 0.8125rem;
        font-weight: 500;
        transition: all var(--transition-fast);
        min-height: 44px;
      }
      .sidebar.collapsed:not(.drawer) .sidebar-nav a {
        justify-content: center;
        padding: 0.6875rem;
      }
      .sidebar-nav a:hover {
        background: var(--primary-light);
        color: var(--primary-color);
      }
      .sidebar-nav a.active {
        background: var(--primary-light);
        color: var(--primary-color);
        font-weight: 600;
      }
      .active-indicator {
        position: absolute;
        inset-inline-start: 0;
        top: 50%;
        transform: translateY(-50%) scaleY(0);
        width: 3px;
        height: 60%;
        background: var(--primary-color);
        border-radius: 0 3px 3px 0;
        transition: transform var(--transition-fast);
      }
      :host-context([dir='rtl']) .active-indicator {
        border-radius: 3px 0 0 3px;
      }
      .sidebar-nav a.active .active-indicator {
        transform: translateY(-50%) scaleY(1);
      }
      .nav-icon {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: var(--page-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        flex-shrink: 0;
        transition: background var(--transition-fast);
      }
      .sidebar-nav a.active .nav-icon,
      .sidebar-nav a:hover .nav-icon {
        background: rgba(1, 170, 78, 0.15);
      }
      .nav-label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sidebar-footer {
        padding: 0.75rem;
        border-top: 1px solid var(--border-light);
        flex-shrink: 0;
      }
      .sidebar-footer--drawer {
        text-align: center;
      }
      .collapse-btn {
        width: 100%;
        padding: 0.5rem;
        background: var(--page-bg);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-sm);
        cursor: pointer;
        font-size: 0.75rem;
        color: var(--text-muted);
        transition: all var(--transition-fast);
      }
      .collapse-btn:hover {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
      .version {
        display: block;
        margin-top: 0.5rem;
        font-size: 0.6875rem;
        color: var(--text-light);
        text-align: center;
      }
      .sidebar-footer--drawer .version {
        margin-top: 0;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @media (min-width: 768px) {
        .close-btn {
          display: none;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly language = inject(LanguageService);
  private readonly auth = inject(AuthService);

  private readonly permissions = toSignal(this.auth.permissions$, {
    initialValue: [] as PermissionSet[],
  });
  private readonly currentUser = toSignal(this.auth.currentUser$, {
    initialValue: null,
  });

  @Input() isOpen = false;
  @Input() collapsed = false;
  @Input() drawerMode = false;
  @Output() close = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  get isRtl(): boolean {
    return this.language.isRtl;
  }

  readonly navItems: NavItem[] = [
    { route: '/dashboard', labelKey: 'nav.dashboard' },
    { route: '/users', labelKey: 'nav.users' },
    { route: '/service-pages', labelKey: 'nav.servicePages' },
    { route: '/quick-links', labelKey: 'nav.quickLinks' },
    { route: '/employee-news', labelKey: 'nav.employeeNews' },
    { route: '/audit-log', labelKey: 'nav.auditLog' },
    { route: '/settings', labelKey: 'nav.settings' },
  ];

  readonly icons: Record<string, string> = {
    '/dashboard': '▣',
    '/users': '👤',
    '/service-pages': '📄',
    '/quick-links': '🔗',
    '/employee-news': '📰',
    '/audit-log': '📋',
    '/settings': '⚙',
  };

  private readonly routeToContentTypeMap: Record<string, ContentType> = {
    '/service-pages': ContentType.ServiceIntroPage,
    '/quick-links': ContentType.QuickLinks,
    '/employee-news': ContentType.EmployeeNews,
    '/audit-log': ContentType.AuditLog,
  };

  get filteredNavItems(): NavItem[] {
    // Read signals so Angular tracks dependency on async updates.
    this.currentUser();
    const perms = this.permissions();

    if (this.auth.isSuperAdmin) {
      return this.navItems;
    }
    return this.navItems.filter((item) => {
      if (item.route === '/dashboard') return false;
      if (item.route === '/users') return false;
      if (item.route === '/settings') return true;

      const ct = this.routeToContentTypeMap[item.route];
      if (!ct) return false;

      const perm = perms.find((p) => (p.contentType ?? p.feature) === ct);
      return perm?.canView ?? false;
    });
  }
}
