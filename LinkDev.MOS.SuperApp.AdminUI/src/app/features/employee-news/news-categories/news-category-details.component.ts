import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { AuthService } from '../../../core/services/auth.service';
import { NewsCategory } from '../../../core/models/employee-news.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-category-details',
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
    } @else if (category) {
      <app-page-header title="news.categoryDetailsTitle">
        <a routerLink="/employee-news/categories" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        @if (canEdit) {
          <a [routerLink]="['/employee-news/categories', category.id, 'edit']" [queryParams]="{ returnTo: 'details' }" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        }
        @if (canDelete) {
          <button type="button" class="btn btn-outline" (click)="showDeleteConfirm = true">{{ 'common.delete' | translate }}</button>
        }
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'news.categoryName' | translate }}</label><span>{{ category.name }}</span></div>
          <div><label>{{ 'common.status' | translate }}</label><app-status-badge [status]="category.isActive ? 'Active' : 'Inactive'" /></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ category.modifiedBy || '—' }}</span></div>
          <div><label>{{ 'users.lastModified' | translate }}</label><span>{{ category.modifiedAt ? (category.modifiedAt | date:'medium') : '—' }}</span></div>
        </div>

        <div class="section">
          <label>{{ 'news.displayOrder' | translate }}</label>
          <p>{{ category.displayOrder }}</p>
        </div>

        <div class="section">
          <label>{{ 'news.assignedEmojis' | translate }}</label>
          @if (category.emojis.length) {
            <div class="filter-chips" style="border-top:none;margin:0.5rem 0 0;padding:0">
              @for (e of category.emojis; track e.id) {
                <span class="filter-chip">{{ e.code }} {{ e.name }}</span>
              }
            </div>
          } @else {
            <p>{{ 'common.none' | translate }}</p>
          }
        </div>

        <div class="section">
          <label>{{ 'news.createdAt' | translate }}</label>
          <p>{{ category.createdAt | date:'medium' }}</p>
        </div>
        <div class="section">
          <label>{{ 'news.createdBy' | translate }}</label>
          <p>{{ category.createdBy || '—' }}</p>
        </div>
      </div>
    }

    <app-confirm-dialog
      [visible]="showDeleteConfirm"
      title="common.confirm"
      message="news.confirmDeleteCategory"
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
export class NewsCategoryDetailsComponent implements OnInit {
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  category: NewsCategory | null = null;
  loading = true;
  showDeleteConfirm = false;

  readonly canEdit = this.auth.hasPermission(ContentType.EmployeeNews, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.EmployeeNews, 'delete');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.categoriesService.getById(id).subscribe({
      next: (item) => {
        this.category = item;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/employee-news/categories']);
      }
    });
  }

  deleteConfirmed(): void {
    if (!this.category) return;
    this.showDeleteConfirm = false;
    this.categoriesService.delete(this.category.id).subscribe({
      next: () => {
        this.toast.success('messages.categoryDeleted');
        this.router.navigate(['/employee-news/categories']);
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }
}
