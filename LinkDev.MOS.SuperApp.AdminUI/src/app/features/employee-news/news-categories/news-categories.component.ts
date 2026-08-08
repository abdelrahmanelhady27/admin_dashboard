import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { AuthService } from '../../../core/services/auth.service';
import { NewsCategory } from '../../../core/models/employee-news.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent,
    ConfirmDialogComponent, EmptyStateComponent, SkeletonComponent, PaginatorComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="news.manageCategories" subtitle="news.categoriesSubtitle">
      <a routerLink="/employee-news" class="btn btn-outline">{{ 'common.back' | translate }}</a>
      @if (canCreate) {
        <a routerLink="/employee-news/categories/create" class="btn btn-primary">+ {{ 'news.createCategory' | translate }}</a>
      }
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="$event.preventDefault()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'news.categorySearchPlaceholder' | translate" />
          <select class="form-select" formControlName="isActive">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            <option value="true">{{ 'common.active' | translate }}</option>
            <option value="false">{{ 'common.inactive' | translate }}</option>
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
    } @else if (!categories.length) {
      <app-empty-state message="news.noCategories" />
    } @else {
      <div class="u-table-wrap">
        <table class="u-table">
          <thead>
            <tr>
              <th>{{ 'news.categoryName' | translate }}</th>
              <th>{{ 'news.displayOrder' | translate }}</th>
              <th>{{ 'common.status' | translate }}</th>
              <th>{{ 'news.assignedEmojis' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (c of categories; track c.id) {
              <tr>
                <td>{{ c.name }}</td>
                <td>{{ c.displayOrder }}</td>
                <td><app-status-badge [status]="c.isActive ? 'Active' : 'Inactive'" size="sm" /></td>
                <td>{{ emojiSummary(c) }}</td>
                <td class="u-table__actions">
                  <a [routerLink]="['/employee-news/categories', c.id]" class="btn-icon" [title]="'common.view' | translate">👁</a>
                  @if (canEdit) {
                    <a [routerLink]="['/employee-news/categories', c.id, 'edit']" class="btn-icon" [title]="'common.edit' | translate">✏</a>
                  }
                  @if (canDelete) {
                    <button type="button" class="btn-icon" (click)="confirmDelete(c)" [title]="'common.delete' | translate">🗑</button>
                  }
                  @if (canEdit && c.isActive) {
                    <button type="button" class="btn-icon" (click)="confirmDeactivate(c)" [title]="'common.deactivate' | translate">⏸</button>
                  }
                  @if (canEdit && !c.isActive) {
                    <button type="button" class="btn-icon" (click)="confirmActivate(c)" [title]="'common.activateItem' | translate">▶</button>
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
  `
})
export class NewsCategoriesComponent implements OnInit {
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  categories: NewsCategory[] = [];
  loading = true;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  showConfirm = false;
  confirmTitle = 'common.confirm';
  confirmMessage = '';
  confirmDanger = false;
  confirmAction: (() => void) | null = null;

  filterForm = this.fb.group({
    search: [''],
    isActive: ['']
  });

  readonly canCreate = this.auth.hasPermission(ContentType.EmployeeNews, 'create');
  readonly canEdit = this.auth.hasPermission(ContentType.EmployeeNews, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.EmployeeNews, 'delete');

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.isActive === 'true') chips.push({ key: 'isActive', label: 'Active' });
    if (v.isActive === 'false') chips.push({ key: 'isActive', label: 'Inactive' });
    return chips;
  }

  ngOnInit(): void {
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
    this.filterForm.reset({ search: '', isActive: '' });
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
  }

  load(): void {
    this.loading = true;
    const v = this.filterForm.value;
    const isActive =
      v.isActive === 'true' ? true : v.isActive === 'false' ? false : null;

    this.categoriesService.getAll({
      search: v.search || undefined,
      isActive,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      sortBy: 'displayOrder',
      sortDescending: false
    }).subscribe({
      next: (result) => {
        this.categories = result.items;
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

  emojiSummary(category: NewsCategory): string {
    return (category.emojis ?? []).map((e) => e.code).join(' ') || '-';
  }

  confirmDelete(category: NewsCategory): void {
    this.openConfirm('news.confirmDeleteCategory', true, () => {
      this.categoriesService.delete(category.id).subscribe({
        next: () => {
          this.toast.success('messages.categoryDeleted');
          this.load();
        },
        error: (err) => this.toast.error(resolveApiErrorKey(err))
      });
    });
  }

  confirmActivate(category: NewsCategory): void {
    this.openConfirm('news.confirmActivateCategory', false, () => {
      this.setActive(category, true, 'messages.categoryActivated');
    });
  }

  confirmDeactivate(category: NewsCategory): void {
    this.openConfirm('news.confirmDeactivateCategory', true, () => {
      this.setActive(category, false, 'messages.categoryDeactivated');
    });
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.confirmAction?.();
    this.confirmAction = null;
  }

  private setActive(category: NewsCategory, isActive: boolean, successKey: string): void {
    this.categoriesService.update(category.id, {
      name: category.name,
      displayOrder: category.displayOrder,
      isActive,
      emojiIds: (category.emojis ?? []).map((e) => e.id)
    }).subscribe({
      next: () => {
        this.toast.success(successKey);
        this.load();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  private openConfirm(message: string, danger: boolean, action: () => void): void {
    this.confirmTitle = 'common.confirm';
    this.confirmMessage = message;
    this.confirmDanger = danger;
    this.confirmAction = action;
    this.showConfirm = true;
  }
}
