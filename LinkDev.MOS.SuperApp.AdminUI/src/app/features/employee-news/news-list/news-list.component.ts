import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { EmployeeNews } from '../../../core/models/employee-news.model';
import { NewsCategory, NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { PaginatorComponent } from '../../../shared/components/paginator/paginator.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent, PaginatorComponent, TranslatePipe, TruncatePipe
  ],
  template: `
    <app-page-header title="nav.employeeNews" subtitle="news.listSubtitle">
      <a routerLink="/employee-news/create" class="btn btn-primary">+ {{ 'common.createNews' | translate }}</a>
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'news.searchPlaceholder' | translate" />
          <select class="form-select" formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            @for (s of statuses; track s) { <option [value]="s">{{ 'status.' + s | translate }}</option> }
          </select>
          <select class="form-select" formControlName="category">
            <option value="">{{ 'news.allCategories' | translate }}</option>
            @for (c of categories; track c) { <option [value]="c">{{ 'newsCategories.' + c | translate }}</option> }
          </select>
          <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
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
                <td>{{ 'newsCategories.' + item.category | translate }}</td>
                <td><app-status-badge [status]="item.status" size="sm" /></td>
                <td>{{ item.createdAt | date:'mediumDate' }}</td>
                <td>{{ item.createdBy }}</td>
                <td>{{ item.modifiedBy }}</td>
                <td>
                  <a [routerLink]="['/employee-news', item.id]" class="btn btn-outline btn-sm">{{ 'common.viewDetails' | translate }}</a>
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
  `,
})
export class NewsListComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  newsItems: EmployeeNews[] = [];
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  readonly statuses = Object.values(NewsStatus);
  readonly categories = Object.values(NewsCategory);
  filterForm = this.fb.group({ search: [''], status: [''], category: [''] });

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.status) chips.push({ key: 'status', label: v.status });
    if (v.category) chips.push({ key: 'category', label: v.category });
    return chips;
  }

  ngOnInit(): void { this.load(); }

  applyFilters(): void {
    this.pageNumber = 1;
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', status: '', category: '' });
    this.pageNumber = 1;
    this.load();
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
    this.pageNumber = 1;
    this.load();
  }

  load(): void {
    this.loading = true;
    setTimeout(() => {
      const v = this.filterForm.value;
      const result = this.newsService.getPaged({
        search: v.search || undefined,
        status: (v.status as NewsStatus) || undefined,
        category: (v.category as NewsCategory) || undefined,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      });
      this.newsItems = result.items;
      this.totalCount = result.totalCount;
      this.pageNumber = result.pageNumber;
      this.pageSize = result.pageSize;
      this.loading = false;
    }, 350);
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
}
