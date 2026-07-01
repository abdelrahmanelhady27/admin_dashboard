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
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TruncatePipe } from '../../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent,
    StatusBadgeComponent, EmptyStateComponent, SkeletonComponent, TranslatePipe, TruncatePipe
  ],
  template: `
    <app-page-header title="nav.employeeNews" subtitle="news.listSubtitle">
      <a routerLink="/employee-news/create" class="btn btn-primary">+ {{ 'common.createNews' | translate }}</a>
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="load()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'news.searchPlaceholder' | translate" />
          <select formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            @for (s of statuses; track s) { <option [value]="s">{{ 'status.' + s | translate }}</option> }
          </select>
          <select formControlName="category">
            <option value="">{{ 'news.allCategories' | translate }}</option>
            @for (c of categories; track c) { <option [value]="c">{{ 'newsCategories.' + c | translate }}</option> }
          </select>
          <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
        </div>
      </form>
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
    }
  `,
})
export class NewsListComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  newsItems: EmployeeNews[] = [];
  readonly statuses = Object.values(NewsStatus);
  readonly categories = Object.values(NewsCategory);
  filterForm = this.fb.group({ search: [''], status: [''], category: [''] });

  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true;
    setTimeout(() => {
      const v = this.filterForm.value;
      this.newsItems = this.newsService.getAll({
        search: v.search || undefined,
        status: (v.status as NewsStatus) || undefined,
        category: (v.category as NewsCategory) || undefined
      });
      this.loading = false;
    }, 350);
  }
}
