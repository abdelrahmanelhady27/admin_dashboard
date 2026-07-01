import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { LanguageService } from '../../../core/services/language.service';
import { ContentType, UserStatus } from '../../../core/models/enums';
import { DashboardUser } from '../../../core/models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent,
    EmptyStateComponent, ConfirmDialogComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.users" subtitle="users.listSubtitle">
      <a routerLink="/users/create" class="btn btn-primary">+ {{ 'common.addUser' | translate }}</a>
    </app-page-header>

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
        <div class="filter-grid">
          <input class="form-input" formControlName="search" [placeholder]="'users.searchPlaceholder' | translate" />
          <select class="form-select" formControlName="status">
            <option value="">{{ 'common.allStatuses' | translate }}</option>
            @for (s of statuses; track s) { <option [value]="s">{{ 'status.' + s | translate }}</option> }
          </select>
          <select class="form-select" formControlName="contentType">
            <option value="">{{ 'users.allContentTypes' | translate }}</option>
            @for (ct of contentTypes; track ct) { <option [value]="ct">{{ 'contentTypes.' + ct | translate }}</option> }
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
        @for (i of [1,2,3,4,5]; track i) {
          <app-skeleton height="48px" [radius]="'var(--radius-sm)'" />
          <div style="height:0.5rem"></div>
        }
      </div>
    } @else if (users.length === 0) {
      <app-empty-state message="users.emptyState" hint="users.emptyHint">
        <a routerLink="/users/create" class="btn btn-primary">{{ 'common.addUser' | translate }}</a>
      </app-empty-state>
    } @else {
      <div class="u-table-wrap">
        <table class="u-table">
          <thead>
            <tr>
              <th>{{ 'users.name' | translate }}</th>
              <th>{{ 'users.email' | translate }}</th>
              <th>{{ 'users.status' | translate }}</th>
              <th>{{ 'users.allowedContentTypes' | translate }}</th>
              <th>{{ 'users.createdAt' | translate }}</th>
              <th>{{ 'users.modifiedBy' | translate }}</th>
              <th>{{ 'users.lastModified' | translate }}</th>
              <th>{{ 'common.actions' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (user of users; track user.id) {
              <tr>
                <td><strong>{{ getName(user) }}</strong></td>
                <td>{{ user.email }}</td>
                <td><app-status-badge [status]="user.status" size="sm" /></td>
                <td>{{ getContentTypes(user) }}</td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
                <td>{{ user.modifiedBy }}</td>
                <td>{{ user.modifiedAt | date:'medium' }}</td>
                <td>
                  <div class="u-table__actions">
                    <a [routerLink]="['/users', user.id]" class="btn-icon" [title]="'common.view' | translate">👁</a>
                    <a [routerLink]="['/users', user.id, 'edit']" class="btn-icon" [title]="'common.edit' | translate">✏</a>
                    <button type="button" class="btn-icon" (click)="confirmDelete(user)" [title]="'common.delete' | translate">🗑</button>
                    @if (user.status !== suspendedStatus) {
                      <button type="button" class="btn-icon" (click)="confirmSuspend(user)" [title]="'common.suspend' | translate">⏸</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <app-confirm-dialog [visible]="showConfirm" [title]="confirmTitle" [message]="confirmMessage"
      [variant]="confirmDanger ? 'danger' : 'default'"
      (confirmed)="onConfirm()" (cancelled)="showConfirm = false" />
  `
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  users: DashboardUser[] = [];
  readonly statuses = Object.values(UserStatus);
  readonly contentTypes = Object.values(ContentType);
  readonly suspendedStatus = UserStatus.Suspended;

  filterForm = this.fb.group({ search: [''], status: [''], contentType: [''] });

  showConfirm = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmDanger = false;
  confirmAction: (() => void) | null = null;

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.status) chips.push({ key: 'status', label: this.language.translate('status.' + v.status) });
    if (v.contentType) chips.push({ key: 'contentType', label: this.language.translate('contentTypes.' + v.contentType) });
    return chips;
  }

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    setTimeout(() => {
      const v = this.filterForm.value;
      this.users = this.usersService.getAll({
        search: v.search || undefined,
        status: (v.status as UserStatus) || undefined,
        contentType: (v.contentType as ContentType) || undefined
      });
      this.loading = false;
    }, 350);
  }

  applyFilters(): void { this.loadUsers(); }

  resetFilters(): void {
    this.filterForm.reset({ search: '', status: '', contentType: '' });
    this.loadUsers();
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
    this.loadUsers();
  }

  getName(user: DashboardUser): string {
    return this.language.currentLang === 'ar' ? user.fullNameAr : user.fullNameEn;
  }

  getContentTypes(user: DashboardUser): string {
    return user.permissions.filter((p) => p.canView).map((p) =>
      this.language.translate(`contentTypes.${p.contentType}`)
    ).join(', ');
  }

  confirmDelete(user: DashboardUser): void {
    this.confirmTitle = 'common.confirm';
    this.confirmMessage = 'users.confirmDelete';
    this.confirmDanger = true;
    this.confirmAction = () => {
      this.usersService.delete(user.id);
      this.toast.success('messages.userDeleted');
      this.loadUsers();
    };
    this.showConfirm = true;
  }

  confirmSuspend(user: DashboardUser): void {
    this.confirmTitle = 'common.confirm';
    this.confirmMessage = 'users.confirmSuspend';
    this.confirmDanger = true;
    this.confirmAction = () => {
      this.usersService.suspend(user.id);
      this.toast.success('messages.userSuspended');
      this.loadUsers();
    };
    this.showConfirm = true;
  }

  onConfirm(): void {
    this.showConfirm = false;
    this.confirmAction?.();
    this.confirmAction = null;
  }
}
