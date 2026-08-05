import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-pages-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent,
    ConfirmDialogComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.servicePages" subtitle="servicePages.listSubtitle">
      @if (canCreate) {
        <a routerLink="/service-pages/create" class="btn btn-primary">+ {{ 'servicePages.createTitle' | translate }}</a>
      }
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="load()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'servicePages.searchPlaceholder' | translate" />
          <select formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            <option value="Draft">{{ 'status.Draft' | translate }}</option>
            <option value="Published">{{ 'status.Published' | translate }}</option>
          </select>
          <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
        </div>
      </form>
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

  pages: ServiceIntroPage[] = [];
  loading = true;
  filterForm = this.fb.group({ search: [''], status: [''] });
  readonly draftStatus = PageStatus.Draft;
  readonly publishedStatus = PageStatus.Published;
  readonly canCreate = this.auth.hasPermission(ContentType.ServiceIntroPage, 'create');
  readonly canEdit = this.auth.hasPermission(ContentType.ServiceIntroPage, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.ServiceIntroPage, 'delete');
  readonly canPublish = this.auth.hasPermission(ContentType.ServiceIntroPage, 'publish');

  showDeleteConfirm = false;
  pageToDelete: ServiceIntroPage | null = null;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.servicePages.getAll({
      search: v.search || undefined,
      status: (v.status as PageStatus) || undefined
    }).subscribe({
      next: (data) => {
        this.pages = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
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
