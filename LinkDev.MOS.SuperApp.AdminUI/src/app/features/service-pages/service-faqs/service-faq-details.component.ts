import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ServiceFaqsService } from '../../../core/services/service-faqs.service';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceFaq } from '../../../core/models/service-page.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-faq-details',
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
    } @else if (faq) {
      <app-page-header title="servicePages.faqDetailsTitle">
        <a routerLink="/service-pages/faqs" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        @if (canEdit) {
          <a [routerLink]="['/service-pages/faqs', faq.id, 'edit']" [queryParams]="{ returnTo: 'details' }" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        }
        @if (canDelete) {
          <button type="button" class="btn btn-outline" (click)="showDeleteConfirm = true">{{ 'common.delete' | translate }}</button>
        }
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'common.status' | translate }}</label><app-status-badge [status]="faq.isActive ? 'Active' : 'Inactive'" /></div>
          <div><label>{{ 'servicePages.faqDisplayOrder' | translate }}</label><span>{{ faq.displayOrder }}</span></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ faq.modifiedBy || '—' }}</span></div>
          <div><label>{{ 'users.lastModified' | translate }}</label><span>{{ faq.modifiedAt ? (faq.modifiedAt | date:'medium') : '—' }}</span></div>
        </div>

        <div class="section">
          <label>{{ 'servicePages.faqQuestion' | translate }}</label>
          <p>{{ faq.question }}</p>
        </div>

        <div class="section">
          <label>{{ 'servicePages.faqAnswer' | translate }}</label>
          <p>{{ faq.answer }}</p>
        </div>

        <div class="section">
          <label>{{ 'servicePages.createdAt' | translate }}</label>
          <p>{{ faq.createdAt | date:'medium' }}</p>
        </div>
        <div class="section">
          <label>{{ 'servicePages.createdBy' | translate }}</label>
          <p>{{ faq.createdBy || '—' }}</p>
        </div>
      </div>
    }

    <app-confirm-dialog
      [visible]="showDeleteConfirm"
      title="common.confirm"
      message="servicePages.confirmDeleteFaq"
      variant="danger"
      (confirmed)="deleteConfirmed()"
      (cancelled)="showDeleteConfirm = false" />
  `,
  styles: [`
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .section { margin-bottom: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--border-color); }
    .section p, .section span { word-break: break-word; overflow-wrap: anywhere; }
    @media (max-width: 767px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ServiceFaqDetailsComponent implements OnInit {
  private readonly faqsService = inject(ServiceFaqsService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  faq: ServiceFaq | null = null;
  loading = true;
  showDeleteConfirm = false;

  readonly canEdit = this.auth.hasPermission(ContentType.ServiceIntroPage, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.ServiceIntroPage, 'delete');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.faqsService.getById(id).subscribe({
      next: (item) => {
        this.faq = item;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/service-pages/faqs']);
      }
    });
  }

  deleteConfirmed(): void {
    if (!this.faq) return;
    this.showDeleteConfirm = false;
    this.faqsService.delete(this.faq.id).subscribe({
      next: () => {
        this.toast.success('messages.faqDeleted');
        this.router.navigate(['/service-pages/faqs']);
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }
}
