import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeNews, NewsCategory } from '../../../core/models/employee-news.model';
import { ContentType, NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent,
    ConfirmDialogComponent, PaginatorComponent, TranslatePipe, TruncatePipe
  ],
  template: `
    <app-page-header title="nav.employeeNews" subtitle="news.listSubtitle">
      <div class="header-actions">
        @if (canCreate) {
          <a routerLink="/employee-news/create" class="btn btn-primary">+ {{ 'common.createNews' | translate }}</a>
        }
        @if (canEdit) {
          <a routerLink="/employee-news/categories" class="btn btn-outline">{{ 'news.manageCategories' | translate }}</a>
          <a routerLink="/employee-news/emojis" class="btn btn-outline">{{ 'news.manageEmojis' | translate }}</a>
        }
      </div>
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="$event.preventDefault()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'news.searchPlaceholder' | translate" />
          <select class="form-select" formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            @for (s of statuses; track s) { <option [value]="s">{{ 'status.' + s | translate }}</option> }
          </select>
          <select class="form-select" formControlName="categoryId">
            <option value="">{{ 'news.allCategories' | translate }}</option>
            @for (c of categories; track c.id) { <option [value]="c.id">{{ c.name }}</option> }
          </select>
          <button type="button" class="btn btn-outline" (click)="resetFilters()">{{ 'common.reset' | translate }}</button>
        </div>
      </form>
      @if (activeFilters.length) {
        <div class="filter-chips">
          @for (chip of activeFilters; track chip.key) {
            <span class="filter-chip">{{ chip.label }} <button type="button" class="filter-chip__remove" (click)="removeFilter(chip.key)">✕</button></span>
          }
          <button type="button" class="btn btn-outline btn-sm" (click)="resetFilters()">{{ 'common.clearFilters' | translate }}</button>
        </div>
      }
    </div>

    @if (loading) {
      <div class="u-table-wrap" style="padding:1rem">
        @for (i of [1,2,3,4]; track i) { <app-skeleton height="48px" /><div style="height:0.5rem"></div> }
      </div>
    } @else if (newsItems.length === 0) {
      <app-empty-state message="news.emptyState" />
    } @else {
      <div class="u-table-wrap">
        <table class="u-table">
          <thead>
            <tr>
              <th>{{ 'news.title' | translate }}</th>
              <th>{{ 'news.shortContent' | translate }}</th>
              <th>{{ 'news.category' | translate }}</th>
              <th>{{ 'news.status' | translate }}</th>
              <th>{{ 'news.createdAt' | translate }}</th>
              <th>{{ 'news.createdBy' | translate }}</th>
              <th>{{ 'users.modifiedBy' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (item of newsItems; track item.id) {
              <tr>
                <td>{{ item.title }}</td>
                <td>{{ item.content | truncate:60 }}</td>
                <td>{{ item.categoryName || ('common.none' | translate) }}</td>
                <td><app-status-badge [status]="item.status" size="sm" /></td>
                <td>{{ item.createdAt | date:'mediumDate' }}</td>
                <td>{{ item.createdBy }}</td>
                <td>{{ item.modifiedBy }}</td>
                <td class="u-table__actions">
                  <a [routerLink]="['/employee-news', item.id]" class="btn-icon" [title]="'common.view' | translate">👁</a>
                  @if (canEdit) {
                    <a [routerLink]="['/employee-news', item.id, 'edit']" [queryParams]="{ returnTo: 'list' }" class="btn-icon" [title]="'common.edit' | translate">✏</a>
                  }
                  @if (canDelete) {
                    <button type="button" class="btn-icon" (click)="confirmDelete(item)" [title]="'common.delete' | translate">🗑</button>
                  }
                  @if (canPublish && (item.status === draftStatus || item.status === unpublishedStatus)) {
                    <button type="button" class="btn btn-primary btn-sm" (click)="confirmPublish(item)">{{ 'common.publish' | translate }}</button>
                  }
                  @if (canPublish && item.status === publishedStatus) {
                    <button type="button" class="btn btn-outline btn-sm" (click)="confirmUnpublish(item)">{{ 'common.unpublish' | translate }}</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <app-paginator
        [pageNumber]="pageNumber"
        [pageSize]="pageSize"
        [totalCount]="totalCount"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      />
    }

    <app-confirm-dialog
      [visible]="showConfirm"
      [title]="confirmTitle"
      [message]="confirmMessage"
      [variant]="confirmDanger ? 'danger' : 'default'"
      (confirmed)="onConfirm()"
      (cancelled)="showConfirm = false" />
  `,
  styles: [`
    .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  `]
})
export class NewsListComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  newsItems: EmployeeNews[] = [];
  categories: NewsCategory[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  readonly statuses = Object.values(NewsStatus);
  readonly draftStatus = NewsStatus.Draft;
  readonly publishedStatus = NewsStatus.Published;
  readonly unpublishedStatus = NewsStatus.Unpublished;
  readonly canCreate = this.auth.hasPermission(ContentType.EmployeeNews, 'create');
  readonly canEdit = this.auth.hasPermission(ContentType.EmployeeNews, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.EmployeeNews, 'delete');
  readonly canPublish = this.auth.hasPermission(ContentType.EmployeeNews, 'publish');

  filterForm = this.fb.group({ search: [''], status: [''], categoryId: [''] });
  showConfirm = false;
  confirmTitle = 'common.confirm';
  confirmMessage = '';
  confirmDanger = false;
  confirmAction: (() => void) | null = null;

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.status) chips.push({ key: 'status', label: v.status });
    if (v.categoryId) {
      const category = this.categories.find((c) => String(c.id) === String(v.categoryId));
      chips.push({ key: 'categoryId', label: category?.name ?? String(v.categoryId) });
    }
    return chips;
  }

  ngOnInit(): void {
    this.categoriesService.getLookup().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.pageNumber = 1;
      this.load();
    });
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', status: '', categoryId: '' });
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
  }

  load(): void {
    this.loading = true;
    const v = this.filterForm.value;
    const categoryId = v.categoryId ? Number(v.categoryId) : undefined;
    this.newsService.getAll({
      search: v.search || undefined,
      status: (v.status as NewsStatus) || undefined,
      categoryId: Number.isFinite(categoryId) ? categoryId : undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: (result) => {
        this.newsItems = result.items;
        this.totalCount = result.totalCount;
        this.pageNumber = result.pageNumber;
        this.pageSize = result.pageSize;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.load();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNumber = 1;
    this.load();
  }

  confirmDelete(item: EmployeeNews): void {
    this.openConfirm('news.confirmDelete', true, () => {
      this.newsService.delete(item.id).subscribe({
        next: () => {
          this.toast.success('messages.newsDeleted');
          this.load();
        },
        error: (err) => this.toast.error(resolveApiErrorKey(err))
      });
    });
  }

  confirmPublish(item: EmployeeNews): void {
    if (!item.title?.trim() || !item.content?.trim() || !item.categoryId) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    this.openConfirm('news.confirmPublish', false, () => {
      this.newsService.publish(item.id).subscribe({
        next: () => {
          this.toast.success('messages.publishedSuccessfully');
          this.load();
        },
        error: (err) => this.toast.error(resolveApiErrorKey(err))
      });
    });
  }

  confirmUnpublish(item: EmployeeNews): void {
    this.openConfirm('news.confirmUnpublish', false, () => {
      this.newsService.unpublish(item.id).subscribe({
        next: () => {
          this.toast.success('messages.unpublishedSuccessfully');
          this.load();
        },
        error: (err) => this.toast.error(resolveApiErrorKey(err))
      });
    });
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.confirmAction?.();
    this.confirmAction = null;
  }

  private openConfirm(message: string, danger: boolean, action: () => void): void {
    this.confirmTitle = 'common.confirm';
    this.confirmMessage = message;
    this.confirmDanger = danger;
    this.confirmAction = action;
    this.showConfirm = true;
  }
}
