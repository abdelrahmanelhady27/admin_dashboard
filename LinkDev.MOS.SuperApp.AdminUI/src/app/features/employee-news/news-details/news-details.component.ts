import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { EmployeeNews } from '../../../core/models/employee-news.model';
import { NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [
    RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent,
    ConfirmDialogComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    @if (loading) {
      <app-skeleton height="2rem" width="200px" />
      <div class="u-card" style="padding:1.5rem;margin-top:1.25rem">
        @for (i of [1,2,3,4,5]; track i) { <app-skeleton height="56px" /><div style="height:0.75rem"></div> }
      </div>
    } @else if (news) {
      <app-page-header title="news.detailsTitle">
        <a routerLink="/employee-news" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        <a [routerLink]="['/employee-news', news.id, 'edit']" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        @if (news.status !== publishedStatus) {
          <button type="button" class="btn btn-primary" (click)="showPublishConfirm = true">{{ 'common.publish' | translate }}</button>
        }
        @if (news.status === publishedStatus) {
          <button type="button" class="btn btn-outline" (click)="showUnpublishConfirm = true">{{ 'common.unpublish' | translate }}</button>
        }
        <button type="button" class="btn btn-outline" (click)="showDeleteConfirm = true">{{ 'common.delete' | translate }}</button>
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'news.title' | translate }}</label><span>{{ news.title }}</span></div>
          <div><label>{{ 'news.category' | translate }}</label><span>{{ 'newsCategories.' + news.category | translate }}</span></div>
          <div><label>{{ 'news.status' | translate }}</label><app-status-badge [status]="news.status" /></div>
          <div><label>{{ 'news.createdBy' | translate }}</label><span>{{ news.createdBy }}</span></div>
          <div><label>{{ 'news.createdAt' | translate }}</label><span>{{ news.createdAt | date:'medium' }}</span></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ news.modifiedBy }}</span></div>
          @if (news.publishedAt) {
            <div><label>{{ 'news.publishedAt' | translate }}</label><span>{{ news.publishedAt | date:'medium' }}</span></div>
          }
          <div><label>{{ 'news.viewsCount' | translate }}</label><span>{{ news.viewsCount }}</span></div>
        </div>

        <div class="section"><label>{{ 'news.content' | translate }}</label><p>{{ news.content }}</p></div>

        @if (news.attachments.length) {
          <div class="section">
            <label>{{ 'news.attachments' | translate }}</label>
            <ul>@for (a of news.attachments; track a.id) { <li>{{ a.fileName }}</li> }</ul>
          </div>
        }

        <div class="section">
          <label>{{ 'news.reactions' | translate }}</label>
          <div class="reactions">
            @for (r of news.reactions; track r.type) {
              <span class="reaction">{{ 'reactions.' + r.type | translate }}: {{ r.count }}</span>
            }
          </div>
        </div>
      </div>
    }

    <app-confirm-dialog [visible]="showPublishConfirm" title="common.confirm" message="news.confirmPublish"
      (confirmed)="publish()" (cancelled)="showPublishConfirm = false" />
    <app-confirm-dialog [visible]="showUnpublishConfirm" title="common.confirm" message="news.confirmUnpublish"
      (confirmed)="unpublish()" (cancelled)="showUnpublishConfirm = false" />
    <app-confirm-dialog [visible]="showDeleteConfirm" title="common.confirm" message="news.confirmDelete" variant="danger"
      (confirmed)="deleteNews()" (cancelled)="showDeleteConfirm = false" />
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .section { margin-bottom: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .reactions { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .reaction { background: var(--primary-light); color: var(--primary-color); padding: 0.375rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8125rem; }
    .section p, .section span { word-break: break-word; overflow-wrap: anywhere; }
    @media (max-width: 767px) {
      .info-grid { grid-template-columns: 1fr; }
      .reactions { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class NewsDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsService = inject(EmployeeNewsService);
  private readonly toast = inject(ToastService);

  news: EmployeeNews | null = null;
  loading = true;
  showPublishConfirm = false;
  showUnpublishConfirm = false;
  showDeleteConfirm = false;
  readonly publishedStatus = NewsStatus.Published;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    setTimeout(() => {
      this.news = this.newsService.getById(id) ?? null;
      this.loading = false;
    }, 350);
  }

  publish(): void {
    if (this.news) {
      this.newsService.publish(this.news.id);
      this.news = this.newsService.getById(this.news.id) ?? null;
      this.toast.success('messages.publishedSuccessfully');
    }
    this.showPublishConfirm = false;
  }

  unpublish(): void {
    if (this.news) {
      this.newsService.unpublish(this.news.id);
      this.news = this.newsService.getById(this.news.id) ?? null;
      this.toast.success('messages.unpublishedSuccessfully');
    }
    this.showUnpublishConfirm = false;
  }

  deleteNews(): void {
    if (this.news) {
      this.newsService.delete(this.news.id);
      this.toast.success('messages.newsDeleted');
      this.router.navigate(['/employee-news']);
    }
    this.showDeleteConfirm = false;
  }
}
