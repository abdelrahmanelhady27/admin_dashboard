import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ServiceIntroPagesService } from '../../../core/services/service-intro-pages.service';
import { AuthService } from '../../../core/services/auth.service';
import { ServiceIntroPage } from '../../../core/models/service-page.model';
import { ContentType, PageStatus } from '../../../core/models/enums';
import { LanguageService } from '../../../core/services/language.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-pages-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent,
    ConfirmDialogComponent, PaginatorComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.servicePages" subtitle="servicePages.listSubtitle">
      @if (canCreate) {
        <a routerLink="/service-pages/create" class="btn btn-primary">+ {{ 'servicePages.createTitle' | translate }}</a>
      }
      @if (canEdit) {
        <a routerLink="/service-pages/faqs" class="btn btn-outline">{{ 'servicePages.manageFaqs' | translate }}</a>
      }
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="$event.preventDefault()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'servicePages.searchPlaceholder' | translate" />
          <select class="form-select" formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ 'status.' + s | translate }}</option>
            }
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
    } @else if (pages.length === 0) {
      <app-empty-state message="servicePages.emptyState" />
    } @else {
      <div class="u-table-wrap">
        <table class="u-table">
          <thead>
            <tr>
              <th>{{ 'servicePages.serviceName' | translate }}</th>
              <th>{{ 'servicePages.pageStatus' | translate }}</th>
              <th>{{ 'users.modifiedBy' | translate }}</th>
              <th>{{ 'users.lastModified' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (page of pages; track page.id) {
              <tr>
                <td>{{ getServiceName(page) }}</td>
                <td><app-status-badge [status]="page.status" size="sm" /></td>
                <td>{{ page.modifiedBy }}</td>
                <td>{{ page.modifiedAt | date:'medium' }}</td>
                <td class="u-table__actions">
                  <a [routerLink]="['/service-pages', page.id]" class="btn-icon" [title]="'common.view' | translate">👁</a>
                  @if (canEdit) {
                    <a [routerLink]="['/service-pages', page.id, 'edit']" [queryParams]="{ returnTo: 'list' }" class="btn-icon" [title]="'common.edit' | translate">✏</a>
                  }
                  @if (canDelete) {
                    <button type="button" class="btn-icon" (click)="confirmDelete(page)" [title]="'common.delete' | translate">🗑</button>
                  }
                  @if (canPublish && page.status === draftStatus) {
                    <button type="button" class="btn btn-primary btn-sm" (click)="publish(page)">{{ 'common.publish' | translate }}</button>
                  }
                  @if (canPublish && page.status === publishedStatus) {
                    <button type="button" class="btn btn-outline btn-sm" (click)="unpublish(page.id)">{{ 'common.unpublish' | translate }}</button>
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
      [visible]="showDeleteConfirm"
      title="common.confirm"
      message="servicePages.confirmDelete"
      variant="danger"
      (confirmed)="deleteConfirmed()"
      (cancelled)="showDeleteConfirm = false" />
  `,
})
export class ServicePagesListComponent implements OnInit {
  private readonly servicePages = inject(ServiceIntroPagesService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  pages: ServiceIntroPage[] = [];
  loading = true;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  filterForm = this.fb.group({ search: [''], status: [''] });
  readonly statuses = Object.values(PageStatus);
  readonly draftStatus = PageStatus.Draft;
  readonly publishedStatus = PageStatus.Published;
  readonly canCreate = this.auth.hasPermission(ContentType.ServiceIntroPage, 'create');
  readonly canEdit = this.auth.hasPermission(ContentType.ServiceIntroPage, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.ServiceIntroPage, 'delete');
  readonly canPublish = this.auth.hasPermission(ContentType.ServiceIntroPage, 'publish');

  showDeleteConfirm = false;
  pageToDelete: ServiceIntroPage | null = null;

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.status) chips.push({ key: 'status', label: v.status });
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
    this.filterForm.reset({ search: '', status: '' });
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
  }

  load(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.servicePages.getAll({
      search: v.search || undefined,
      status: (v.status as PageStatus) || undefined,
      pageNumber: this.pageNumber,
      pageSize: this.pageSize
    }).subscribe({
      next: (result) => {
        this.pages = result.items;
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

  getServiceName(page: ServiceIntroPage): string {
    return this.language.currentLang === 'ar' ? page.serviceNameAr : page.serviceNameEn;
  }

  confirmDelete(page: ServiceIntroPage): void {
    this.pageToDelete = page;
    this.showDeleteConfirm = true;
  }

  deleteConfirmed(): void {
    if (!this.pageToDelete) {
      this.showDeleteConfirm = false;
      return;
    }
    const id = this.pageToDelete.id;
    this.showDeleteConfirm = false;
    this.pageToDelete = null;
    this.servicePages.delete(id).subscribe({
      next: () => {
        this.toast.success('messages.servicePageDeleted');
        this.load();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  publish(page: ServiceIntroPage): void {
    if (!page.description?.trim() || !page.processingDuration?.trim()) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    this.servicePages.publish(page.id).subscribe({
      next: () => {
        this.toast.success('messages.publishedSuccessfully');
        this.load();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  unpublish(id: number): void {
    this.servicePages.unpublish(id).subscribe({
      next: () => {
        this.toast.success('messages.unpublishedSuccessfully');
        this.load();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }
}
