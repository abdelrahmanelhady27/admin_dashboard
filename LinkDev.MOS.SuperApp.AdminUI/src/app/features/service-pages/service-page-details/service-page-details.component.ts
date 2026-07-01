import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ServicePagesService } from '../../../core/services/service-pages.service';
import { ServiceIntroPage } from '../../../core/models/service-page.model';
import { PageStatus } from '../../../core/models/enums';
import { LanguageService } from '../../../core/services/language.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-service-page-details',
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
    } @else if (page) {
      <app-page-header title="servicePages.detailsTitle">
        <a routerLink="/service-pages" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        <a [routerLink]="['/service-pages', page.id, 'edit']" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        @if (page.status === draftStatus || page.status === unpublishedStatus) {
          <button type="button" class="btn btn-primary" (click)="showPublishConfirm = true">{{ 'common.publish' | translate }}</button>
        }
        @if (page.status === publishedStatus) {
          <button type="button" class="btn btn-outline" (click)="showUnpublishConfirm = true">{{ 'common.unpublish' | translate }}</button>
        }
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'servicePages.serviceName' | translate }}</label><span>{{ getServiceName(page) }}</span></div>
          <div><label>{{ 'servicePages.pageStatus' | translate }}</label><app-status-badge [status]="page.status" /></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ page.modifiedBy }}</span></div>
          <div><label>{{ 'users.lastModified' | translate }}</label><span>{{ page.modifiedAt | date:'medium' }}</span></div>
        </div>

        <div class="section"><label>{{ 'servicePages.description' | translate }}</label><p>{{ page.description || '—' }}</p></div>
        <div class="section"><label>{{ 'servicePages.processingDuration' | translate }}</label><p>{{ page.processingDuration || '—' }}</p></div>

        @if (page.videoUrl || page.videoFileName) {
          <div class="section">
            <label>{{ 'servicePages.video' | translate }}</label>
            <p>{{ page.videoFileName || page.videoUrl }}</p>
          </div>
        }

        @if (page.documents.length) {
          <div class="section">
            <label>{{ 'servicePages.documents' | translate }}</label>
            <ul>@for (doc of page.documents; track doc.id) { <li>{{ doc.name }} ({{ doc.fileName }})</li> }</ul>
          </div>
        }

        @if (page.faqs.length) {
          <div class="section">
            <label>{{ 'servicePages.faqs' | translate }}</label>
            @for (faq of page.faqs; track faq.id) {
              <div class="faq"><strong>{{ faq.question }}</strong><p>{{ faq.answer }}</p></div>
            }
          </div>
        }
      </div>
    }

    <app-confirm-dialog [visible]="showPublishConfirm" title="common.confirm" message="servicePages.confirmPublish"
      (confirmed)="publish()" (cancelled)="showPublishConfirm = false" />
    <app-confirm-dialog [visible]="showUnpublishConfirm" title="common.confirm" message="servicePages.confirmUnpublish"
      (confirmed)="unpublish()" (cancelled)="showUnpublishConfirm = false" />
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .section { margin-bottom: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .faq { margin-bottom: 0.75rem; }
    ul { margin: 0; padding-inline-start: 1.25rem; }
    .section p, .section span, .section li { word-break: break-word; overflow-wrap: anywhere; }
    @media (max-width: 767px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ServicePageDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly servicePages = inject(ServicePagesService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);

  page: ServiceIntroPage | null = null;
  loading = true;
  showPublishConfirm = false;
  showUnpublishConfirm = false;
  readonly draftStatus = PageStatus.Draft;
  readonly publishedStatus = PageStatus.Published;
  readonly unpublishedStatus = PageStatus.Unpublished;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    setTimeout(() => {
      this.page = this.servicePages.getById(id) ?? null;
      this.loading = false;
    }, 350);
  }

  getServiceName(page: ServiceIntroPage): string {
    return this.language.currentLang === 'ar' ? page.serviceNameAr : page.serviceNameEn;
  }

  publish(): void {
    if (this.page) {
      this.servicePages.publish(this.page.id);
      this.page = this.servicePages.getById(this.page.id) ?? null;
      this.toast.success('messages.publishedSuccessfully');
    }
    this.showPublishConfirm = false;
  }

  unpublish(): void {
    if (this.page) {
      this.servicePages.unpublish(this.page.id);
      this.page = this.servicePages.getById(this.page.id) ?? null;
      this.toast.success('messages.unpublishedSuccessfully');
    }
    this.showUnpublishConfirm = false;
  }
}
