import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDirectoryService } from '../../../core/services/mock-directory.service';
import { UsersService } from '../../../core/services/users.service';
import { DirectoryUser } from '../../../core/models/user.model';
import { ContentType, UserStatus } from '../../../core/models/enums';
import { PermissionSet, createEmptyPermissionSet } from '../../../core/models/permission.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent,
    PermissionMatrixComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="users.createTitle" subtitle="users.createSubtitle" />

    <div class="u-card" style="padding:1.5rem">
      <div class="form-section">
        <h3 class="form-section__title">{{ 'users.directorySearch' | translate }}</h3>
        <p class="form-helper" style="margin-bottom:1rem">{{ 'users.directoryHint' | translate }}</p>
        <form [formGroup]="searchForm" (ngSubmit)="search()" class="search-row">
          <input class="form-input" formControlName="term" [placeholder]="'users.searchDirectory' | translate" />
          <button type="submit" class="btn btn-primary">{{ 'common.search' | translate }}</button>
        </form>

      @if (searchResults.length) {
        <div class="results">
          @for (user of searchResults; track user.id) {
            <button type="button" class="result-item" [class.selected]="selectedUser?.id === user.id" (click)="selectUser(user)">
              <span>{{ getName(user) }}</span>
              <span>{{ user.email }}</span>
              <app-status-badge [status]="user.status" size="sm" />
            </button>
          }
        </div>
      }

      @if (selectedUser) {
        <div class="selected-info">
          <h4>{{ 'users.selectedUser' | translate }}</h4>
          <div class="info-grid">
            <div><label>{{ 'users.name' | translate }}</label><span>{{ getName(selectedUser) }}</span></div>
            <div><label>{{ 'users.email' | translate }}</label><span>{{ selectedUser.email }}</span></div>
            <div><label>{{ 'users.status' | translate }}</label><app-status-badge [status]="selectedUser.status" size="sm" /></div>
          </div>
          @if (selectedUser.status === inactiveStatus) {
            <div class="alert alert-error">{{ 'validation.inactiveDirectoryUser' | translate }}</div>
          }
        </div>
      }
      </div>

      @if (selectedUser && selectedUser.status === activeStatus) {
        <div class="form-section">
          <h4 class="form-section__title">{{ 'users.selectContentTypes' | translate }}</h4>
          @for (ct of contentTypes; track ct) {
            <label class="checkbox-label">
              <input type="checkbox" [checked]="selectedContentTypes.includes(ct)" (change)="toggleContentType(ct, $event)" />
              {{ 'contentTypes.' + ct | translate }}
            </label>
          }
        </div>

        @if (selectedContentTypes.length) {
          <app-permission-matrix
            [permissions]="permissions"
            [selectedContentTypes]="selectedContentTypes"
            (permissionsChange)="onPermissionsChange($event)" />
        }

        <div class="form-action-bar">
          <a routerLink="/users" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
          <button type="button" class="btn btn-primary" (click)="save()">{{ 'common.save' | translate }}</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
    .search-row input { flex: 1; }
    .results { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
    .result-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
      border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--page-bg);
      cursor: pointer; text-align: start; transition: all var(--transition-fast);
    }
    .result-item:hover { border-color: var(--primary-color); background: var(--primary-light); }
    .result-item.selected { border-color: var(--primary-color); background: var(--primary-light); }
    .selected-info { margin: 1.5rem 0; padding-top: 1.5rem; border-top: 1px solid var(--border-light); }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .alert-error { background: var(--danger-light); color: var(--danger-color); padding: 0.75rem; border-radius: var(--radius-md); margin-top: 1rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; }
  `]
})
export class UserCreateComponent {
  private readonly directory = inject(MockDirectoryService);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  searchForm = this.fb.group({ term: ['', Validators.required] });
  searchResults: DirectoryUser[] = [];
  selectedUser: DirectoryUser | null = null;
  selectedContentTypes: ContentType[] = [];
  permissions: PermissionSet[] = Object.values(ContentType).map(createEmptyPermissionSet);

  readonly contentTypes = Object.values(ContentType);
  readonly activeStatus = UserStatus.Active;
  readonly inactiveStatus = UserStatus.Inactive;

  search(): void {
    if (this.searchForm.invalid) {
      this.toast.warning('validation.searchTermRequired');
      return;
    }
    this.searchResults = this.directory.search(this.searchForm.value.term!);
  }

  selectUser(user: DirectoryUser): void {
    this.selectedUser = user;
  }

  getName(user: DirectoryUser): string {
    return this.language.currentLang === 'ar' ? user.fullNameAr : user.fullNameEn;
  }

  toggleContentType(ct: ContentType, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedContentTypes = [...this.selectedContentTypes, ct];
    } else {
      this.selectedContentTypes = this.selectedContentTypes.filter((c) => c !== ct);
      this.permissions = this.permissions.map((p) =>
        p.contentType === ct ? createEmptyPermissionSet(ct) : p
      );
    }
  }

  onPermissionsChange(perms: PermissionSet[]): void {
    this.permissions = perms;
  }

  save(): void {
    if (!this.selectedUser) {
      this.toast.error('validation.userSelectionRequired');
      return;
    }
    if (this.selectedUser.status !== UserStatus.Active) {
      this.toast.error('validation.inactiveDirectoryUser');
      return;
    }
    if (this.usersService.existsByDirectoryUserId(this.selectedUser.id)) {
      this.toast.error('validation.duplicateDashboardUser');
      return;
    }
    if (!this.selectedContentTypes.length) {
      this.toast.error('validation.contentTypeRequired');
      return;
    }

    const activePerms = this.permissions.filter((p) => this.selectedContentTypes.includes(p.contentType));
    const hasView = activePerms.some((p) => p.canView);
    if (!hasView) {
      this.toast.error('validation.viewPermissionRequired');
      return;
    }

    for (const perm of activePerms) {
      const hasAdvanced = perm.canCreate || perm.canEdit || perm.canDelete || perm.canPublish;
      if (hasAdvanced && !perm.canView) {
        this.toast.error('validation.advancedRequiresView');
        return;
      }
    }

    this.usersService.create({
      directoryUserId: this.selectedUser.id,
      fullNameAr: this.selectedUser.fullNameAr,
      fullNameEn: this.selectedUser.fullNameEn,
      email: this.selectedUser.email,
      status: UserStatus.Active,
      permissions: activePerms
    });

    this.toast.success('messages.userAdded');
    this.router.navigate(['/users']);
  }
}
