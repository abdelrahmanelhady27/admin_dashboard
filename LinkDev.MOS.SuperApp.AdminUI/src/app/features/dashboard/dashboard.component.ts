import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UsersService } from '../../core/services/users.service';
import { ServiceIntroPagesService } from '../../core/services/service-intro-pages.service';
import { QuickLinksService } from '../../core/services/quick-links.service';
import { EmployeeNewsService } from '../../core/services/employee-news.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { AuthService } from '../../core/services/auth.service';
import { PageStatus } from '../../core/models/enums';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, StatusBadgeComponent, SkeletonComponent, TranslatePipe],
  template: `
    @if (loading) {
      <div class="skeleton-page">
        <app-skeleton height="2rem" width="240px" />
        <div class="stats-grid" style="margin-top:1.5rem">
          @for (i of [1,2,3,4,5]; track i) {
            <app-skeleton height="96px" [radius]="'var(--radius-lg)'" />
          }
        </div>
      </div>
    } @else {
      <!-- Welcome banner -->
      <div class="welcome-banner u-card">
        <div class="welcome-banner__text">
          <span class="welcome-banner__date">{{ today | date:'fullDate' }}</span>
          <h2>{{ 'dashboard.welcome' | translate }}, {{ userName }} 👋</h2>
          <p>{{ 'dashboard.welcomeDesc' | translate }}</p>
        </div>
        <img src="assets/images/main-illustration.svg" alt="" class="welcome-banner__img" />
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        @for (stat of stats; track stat.labelKey) {
          <div class="stat-card u-card u-card--hover">
            <div class="stat-card__icon" [style.background]="stat.bg">{{ stat.icon }}</div>
            <div class="stat-card__body">
              <span class="stat-card__value">{{ stat.value }}</span>
              <span class="stat-card__label">{{ stat.labelKey | translate }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Quick actions -->
      <div class="section-header">
        <h3>{{ 'dashboard.quickActions' | translate }}</h3>
        <p>{{ 'dashboard.quickActionsDesc' | translate }}</p>
      </div>
      <div class="quick-actions">
        @for (action of quickActions; track action.route) {
          <a [routerLink]="action.route" class="quick-action u-card u-card--hover">
            <span class="quick-action__icon">{{ action.icon }}</span>
            <span class="quick-action__label">{{ action.labelKey | translate }}</span>
            <span class="quick-action__arrow">→</span>
          </a>
        }
      </div>

      <div class="dashboard-grid">
        <!-- Activity timeline -->
        <div class="u-card dashboard-panel dashboard-panel--wide">
          <div class="panel-header">
            <div>
              <h3>{{ 'dashboard.recentActivity' | translate }}</h3>
              <p>{{ 'dashboard.recentActivityDesc' | translate }}</p>
            </div>
            <a routerLink="/audit-log" class="panel-link">{{ 'dashboard.viewAll' | translate }}</a>
          </div>
          <div class="timeline">
            @for (log of recentLogs; track log.id) {
              <div class="timeline__item">
                <div class="timeline__dot"></div>
                <div class="timeline__content">
                  <strong>{{ 'auditActions.' + log.action | translate }}</strong>
                  <span>{{ log.entityName }}</span>
                  <small>{{ log.performedBy }} · {{ log.performedAt | date:'short' }}</small>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Latest news -->
        <div class="u-card dashboard-panel">
          <div class="panel-header">
            <div>
              <h3>{{ 'dashboard.latestUpdates' | translate }}</h3>
              <p>{{ 'dashboard.recentNews' | translate }}</p>
            </div>
          </div>
          @for (item of recentNews; track item.id) {
            <a [routerLink]="['/employee-news', item.id]" class="news-row">
              <div>
                <strong>{{ item.title }}</strong>
                <small>{{ item.createdAt | date:'mediumDate' }}</small>
              </div>
              <app-status-badge [status]="item.status" size="sm" />
            </a>
          }
        </div>

        <!-- Chart placeholder -->
        <div class="u-card dashboard-panel">
          <div class="panel-header">
            <div>
              <h3>{{ 'dashboard.analytics' | translate }}</h3>
              <p>{{ 'dashboard.chartPlaceholder' | translate }}</p>
            </div>
          </div>
          <div class="chart-modern">
            <div class="chart-bars">
              @for (bar of chartBars; track $index) {
                <div class="chart-bar" [style.height.%]="bar"></div>
              }
            </div>
            <div class="chart-labels">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            </div>
          </div>
        </div>

        <!-- Status overview -->
        <div class="u-card dashboard-panel">
          <div class="panel-header">
            <div>
              <h3>{{ 'dashboard.statusOverview' | translate }}</h3>
              <p>{{ 'dashboard.statusOverviewDesc' | translate }}</p>
            </div>
          </div>
          <div class="status-overview">
            <div class="status-row"><span>{{ 'dashboard.publishedPages' | translate }}</span><strong>{{ publishedPages }}</strong></div>
            <div class="status-row"><span>{{ 'dashboard.draftPages' | translate }}</span><strong>{{ draftPages }}</strong></div>
            <div class="status-row"><span>{{ 'dashboard.publishedNews' | translate }}</span><strong>{{ publishedNews }}</strong></div>
            <div class="status-row"><span>{{ 'dashboard.quickLinksCount' | translate }}</span><strong>{{ quickLinksCount }}</strong></div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .welcome-banner { display: flex; align-items: center; justify-content: space-between; padding: 1.75rem 2rem; margin-bottom: 1.75rem; background: linear-gradient(135deg, var(--primary-light) 0%, #fff 60%); gap: 1.5rem; overflow: hidden; }
    .welcome-banner__date { font-size: 0.75rem; color: var(--primary-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .welcome-banner h2 { margin: 0.375rem 0 0.5rem; font-size: 1.375rem; font-weight: 700; color: var(--text-dark); }
    .welcome-banner p { margin: 0; font-size: 0.875rem; color: var(--text-muted); max-width: 420px; }
    .welcome-banner__img { width: 200px; flex-shrink: 0; opacity: 0.9; }
    .stats-grid {
      display: grid;
      gap: 1rem;
      margin-bottom: 1.75rem;
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; }
    .stat-card__icon { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.125rem; flex-shrink: 0; }
    .stat-card__value { display: block; font-size: 1.625rem; font-weight: 700; color: var(--text-dark); line-height: 1.1; }
    .stat-card__label { font-size: 0.75rem; color: var(--text-muted); }
    .section-header { margin-bottom: 1rem; }
    .section-header h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .section-header p { margin: 0.25rem 0 0; font-size: 0.8125rem; color: var(--text-muted); }
    .quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.75rem; }
    .quick-action { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; text-decoration: none; color: var(--text-dark); }
    .quick-action__icon { width: 36px; height: 36px; border-radius: var(--radius-md); background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .quick-action__label { flex: 1; font-size: 0.8125rem; font-weight: 500; }
    .quick-action__arrow { color: var(--text-light); transition: transform var(--transition-fast); }
    .quick-action:hover .quick-action__arrow { transform: translateX(4px); color: var(--primary-color); }
    .dashboard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }
    .dashboard-panel { padding: 1.375rem 1.5rem; }
    .dashboard-panel--wide { grid-column: 1 / -1; }
    .panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; gap: 1rem; }
    .panel-header h3 { margin: 0; font-size: 0.9375rem; font-weight: 600; }
    .panel-header p { margin: 0.1875rem 0 0; font-size: 0.75rem; color: var(--text-muted); }
    .panel-link { font-size: 0.8125rem; color: var(--primary-color); font-weight: 500; text-decoration: none; white-space: nowrap; }
    .panel-link:hover { text-decoration: underline; }
    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline__item { display: flex; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); position: relative; }
    .timeline__item:last-child { border-bottom: none; }
    .timeline__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--primary-color); margin-top: 0.375rem; flex-shrink: 0; box-shadow: 0 0 0 3px var(--primary-light); }
    .timeline__content { display: flex; flex-direction: column; gap: 0.125rem; }
    .timeline__content strong { font-size: 0.8125rem; color: var(--text-dark); }
    .timeline__content span { font-size: 0.8125rem; color: var(--text-muted); }
    .timeline__content small { font-size: 0.6875rem; color: var(--text-light); }
    .news-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); text-decoration: none; color: inherit; transition: background var(--transition-fast); border-radius: var(--radius-sm); }
    .news-row:last-child { border-bottom: none; }
    .news-row:hover { background: var(--page-bg); padding-inline: 0.5rem; margin-inline: -0.5rem; }
    .news-row strong { display: block; font-size: 0.8125rem; color: var(--text-dark); }
    .news-row small { font-size: 0.6875rem; color: var(--text-light); }
    .chart-modern { padding: 0.5rem 0; }
    .chart-bars { display: flex; align-items: flex-end; gap: 0.75rem; height: 140px; padding: 0 0.5rem; }
    .chart-bar { flex: 1; background: linear-gradient(180deg, var(--primary-color), var(--primary-light)); border-radius: 6px 6px 0 0; min-height: 12px; transition: height 0.6s ease; opacity: 0.85; }
    .chart-labels { display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.6875rem; color: var(--text-light); padding: 0 0.5rem; }
    .status-overview { display: flex; flex-direction: column; gap: 0.75rem; }
    .status-row { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.875rem; background: var(--page-bg); border-radius: var(--radius-md); font-size: 0.8125rem; }
    .status-row span { color: var(--text-muted); }
    .status-row strong { color: var(--primary-color); font-size: 1rem; }
    @media (max-width: 1199px) {
      .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (max-width: 991px) {
      .welcome-banner { flex-direction: column; text-align: center; padding: 1.5rem; }
      .welcome-banner p { max-width: none; }
      .welcome-banner__img { width: clamp(120px, 40vw, 180px); }
      .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .dashboard-grid { grid-template-columns: 1fr; }
      .dashboard-panel--wide { grid-column: auto; }
      .quick-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 767px) {
      .stats-grid { grid-template-columns: 1fr; }
      .quick-actions { grid-template-columns: 1fr; }
      .welcome-banner h2 { font-size: 1.125rem; }
      .panel-header { flex-direction: column; align-items: flex-start; }
      .chart-bars { height: 100px; gap: 0.5rem; }
      .news-row { flex-wrap: wrap; }
    }
    @media (max-width: 479px) {
      .welcome-banner { padding: 1.25rem; margin-bottom: 1.25rem; }
      .stat-card { padding: 1rem; }
      .stat-card__value { font-size: 1.375rem; }
      .dashboard-panel { padding: 1.125rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly users = inject(UsersService);
  private readonly serviceIntroPages = inject(ServiceIntroPagesService);
  private readonly quickLinks = inject(QuickLinksService);
  private readonly news = inject(EmployeeNewsService);
  private readonly auditLog = inject(AuditLogService);
  private readonly auth = inject(MockAuthService);
  private readonly realAuth = inject(AuthService);


  loading = true;
  today = new Date();
  recentLogs: ReturnType<AuditLogService['getRecent']> = [];
  recentNews: ReturnType<EmployeeNewsService['getLatestPublished']> = [];
  chartBars = [45, 72, 58, 90, 65, 80];
  publishedPages = 0;
  draftPages = 0;
  publishedNews = 0;
  quickLinksCount = 0;

  get userName(): string {
    const user = this.auth.currentUser;
    if (!user) return 'Admin';
    return user.fullNameEn;
  }

  get stats() {
    return [
      { labelKey: 'dashboard.totalUsers', value: this.users.getCount(), icon: '👤', bg: 'var(--primary-light)' },
      { labelKey: 'dashboard.publishedPages', value: this.publishedPages, icon: '📄', bg: '#DBEAFE' },
      { labelKey: 'dashboard.draftPages', value: this.draftPages, icon: '📝', bg: 'var(--warning-light)' },
      { labelKey: 'dashboard.quickLinksCount', value: this.quickLinksCount, icon: '🔗', bg: '#F3E8FF' },
      { labelKey: 'dashboard.publishedNews', value: this.publishedNews, icon: '📰', bg: 'var(--primary-light)' }
    ];
  }

  readonly rawQuickActions = [
    { route: '/users/create', labelKey: 'common.addUser', icon: '👤' },
    { route: '/service-pages/create', labelKey: 'servicePages.createTitle', icon: '📄' },
    { route: '/quick-links', labelKey: 'nav.quickLinks', icon: '🔗' },
    { route: '/employee-news/create', labelKey: 'common.createNews', icon: '📰' }
  ];

  get quickActions() {
    if (this.realAuth.hasRole('Admin')) {
      return this.rawQuickActions.filter(action => action.route !== '/users/create');
    }
    return this.rawQuickActions;
  }

  ngOnInit(): void {
    this.publishedNews = this.news.getPublishedCount();
    this.quickLinksCount = this.quickLinks.getCount();
    this.recentLogs = this.auditLog.getRecent(6);
    this.recentNews = this.news.getLatestPublished(4);

    this.serviceIntroPages.getAll().subscribe({
      next: (pages) => {
        this.publishedPages = pages.filter((p) => p.status === PageStatus.Published).length;
        this.draftPages = pages.filter((p) => p.status === PageStatus.Draft).length;
        this.loading = false;
      },
      error: () => {
        this.publishedPages = 0;
        this.draftPages = 0;
        this.loading = false;
      }
    });
  }
}
