import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ServicePagesService } from '../../../core/services/service-pages.service';
import { ServiceIntroPage } from '../../../core/models/service-page.model';
import { PageStatus } from '../../../core/models/enums';
import { LanguageService } from '../../../core/services/language.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-service-pages-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.servicePages" subtitle="servicePages.listSubtitle">
      <a routerLink="/service-pages/create" class="btn btn-primary">+ {{ 'servicePages.createTitle' | translate }}</a>
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
                  <a [routerLink]="['/service-pages', page.id]" class="btn-icon" title="View">👁</a>
                  <a [routerLink]="['/service-pages', page.id, 'edit']" class="btn-icon" title="Edit">✏</a>
                  @if (page.status === draftStatus) {
                    <button type="button" class="btn btn-primary btn-sm" (click)="publish(page.id)">{{ 'common.publish' | translate }}</button>
                  }
                  @if (page.status === publishedStatus) {
                    <button type="button" class="btn btn-outline btn-sm" (click)="unpublish(page.id)">{{ 'common.unpublish' | translate }}</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class ServicePagesListComponent implements OnInit {
  private readonly servicePages = inject(ServicePagesService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  pages: ServiceIntroPage[] = [];
  loading = true;
  filterForm = this.fb.group({ search: [''], status: [''] });
  readonly draftStatus = PageStatus.Draft;
  readonly publishedStatus = PageStatus.Published;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    setTimeout(() => {
      const v = this.filterForm.value;
      this.pages = this.servicePages.getAll({
        search: v.search || undefined,
        status: (v.status as PageStatus) || undefined
      });
      this.loading = false;
    }, 350);
  }

  getServiceName(page: ServiceIntroPage): string {
    return this.language.currentLang === 'ar' ? page.serviceNameAr : page.serviceNameEn;
  }

  publish(id: string): void {
    this.servicePages.publish(id);
    this.toast.success('messages.publishedSuccessfully');
    this.load();
  }

  unpublish(id: string): void {
    this.servicePages.unpublish(id);
    this.toast.success('messages.unpublishedSuccessfully');
    this.load();
  }
}
