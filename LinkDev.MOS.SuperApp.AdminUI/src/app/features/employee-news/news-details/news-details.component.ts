import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeNews } from '../../../core/models/employee-news.model';
import { ContentType, NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent,
    ConfirmDialogComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    @if (loading) {
      <app-skeleton height="2rem" width="220px" />
      <div class="u-card" style="padding:1.5rem;margin-top:1.25rem">
        @for (i of [1,2,3,4]; track i) { <app-skeleton height="64px" /><div style="height:0.75rem"></div> }
      </div>
    } @else if (news) {
      <app-page-header title="news.detailsTitle">
        <a routerLink="/employee-news" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        @if (canEdit) {
          <a [routerLink]="['/employee-news', news.id, 'edit']" [queryParams]="{ returnTo: 'details' }" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        }
        @if (canPublish && (news.status === draftStatus || news.status === unpublishedStatus)) {
          <button type="button" class="btn btn-primary" (click)="showPublishConfirm = true">{{ 'common.publish' | translate }}</button>
        }
        @if (canPublish && news.status === publishedStatus) {
          <button type="button" class="btn btn-outline" (click)="showUnpublishConfirm = true">{{ 'common.unpublish' | translate }}</button>
        }
        @if (canDelete) {
          <button type="button" class="btn btn-outline" (click)="showDeleteConfirm = true">{{ 'common.delete' | translate }}</button>
        }
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'news.title' | translate }}</label><span>{{ news.title }}</span></div>
          <div><label>{{ 'news.status' | translate }}</label><app-status-badge [status]="news.status" /></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ news.modifiedBy || '—' }}</span></div>
          <div><label>{{ 'users.lastModified' | translate }}</label><span>{{ news.modifiedAt ? (news.modifiedAt | date:'medium') : '—' }}</span></div>
        </div>

        <div class="section">
          <label>{{ 'news.category' | translate }}</label>
          <p>{{ news.categoryName || ('common.none' | translate) }}</p>
        </div>

        <div class="section">
          <label>{{ 'news.content' | translate }}</label>
          <p class="content">{{ news.content || '—' }}</p>
        </div>

        @if (news.imageUrl || news.imageFileName) {
          <div class="section">
            <label>{{ 'news.coverImage' | translate }}</label>
            <p>
              <a [href]="news.imageUrl || '#'" target="_blank" rel="noopener">
                {{ news.imageFileName || ('news.coverImage' | translate) }}
              </a>
            </p>
          </div>
        }

        @if (news.attachments.length) {
          <div class="section">
            <label>{{ 'news.attachments' | translate }}</label>
            <ul>
              @for (a of news.attachments; track a.id) {
                <li><a [href]="a.fileUrl || '#'" target="_blank" rel="noopener">{{ a.name }}</a></li>
              }
            </ul>
          </div>
        }

        <div class="section">
          <label>{{ 'news.createdAt' | translate }}</label>
          <p>{{ news.createdAt | date:'medium' }}</p>
        </div>
        <div class="section">
          <label>{{ 'news.createdBy' | translate }}</label>
          <p>{{ news.createdBy || '—' }}</p>
        </div>
        <div class="section">
          <label>{{ 'news.publishedAt' | translate }}</label>
          <p>{{ news.publishedAt ? (news.publishedAt | date:'medium') : '—' }}</p>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showPublishConfirm" title="common.confirm" message="news.confirmPublish"
      (confirmed)="publish()" (cancelled)="showPublishConfirm = false" />
    <app-confirm-dialog [visible]="showUnpublishConfirm" title="common.confirm" message="news.confirmUnpublish"
      (confirmed)="unpublish()" (cancelled)="showUnpublishConfirm = false" />
    <app-confirm-dialog [visible]="showDeleteConfirm" title="common.confirm" message="news.confirmDelete" variant="danger"
      (confirmed)="deleteConfirmed()" (cancelled)="showDeleteConfirm = false" />
  `,
  styles: [`
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .section { margin-bottom: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .content { white-space: pre-wrap; }
    ul { margin: 0; padding-inline-start: 1.25rem; }
    .section p, .section span, .section li { word-break: break-word; overflow-wrap: anywhere; }
    @media (max-width: 767px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class NewsDetailsComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  news: EmployeeNews | null = null;
  loading = true;
  showPublishConfirm = false;
  showUnpublishConfirm = false;
  showDeleteConfirm = false;

  readonly draftStatus = NewsStatus.Draft;
  readonly publishedStatus = NewsStatus.Published;
  readonly unpublishedStatus = NewsStatus.Unpublished;
  readonly canEdit = this.auth.hasPermission(ContentType.EmployeeNews, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.EmployeeNews, 'delete');
  readonly canPublish = this.auth.hasPermission(ContentType.EmployeeNews, 'publish');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.newsService.getById(id).subscribe({
      next: (item) => {
        this.news = item;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/employee-news']);
      }
    });
  }

  publish(): void {
    if (!this.news) return;
    this.showPublishConfirm = false;
    this.newsService.publish(this.news.id).subscribe({
      next: (item) => {
        this.news = item;
        this.toast.success('messages.publishedSuccessfully');
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  unpublish(): void {
    if (!this.news) return;
    this.showUnpublishConfirm = false;
    this.newsService.unpublish(this.news.id).subscribe({
      next: (item) => {
        this.news = item;
        this.toast.success('messages.unpublishedSuccessfully');
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  deleteConfirmed(): void {
    if (!this.news) return;
    this.showDeleteConfirm = false;
    this.newsService.delete(this.news.id).subscribe({
      next: () => {
        this.toast.success('messages.newsDeleted');
        this.router.navigate(['/employee-news']);
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }
}
