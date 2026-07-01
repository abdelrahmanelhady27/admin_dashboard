import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { DashboardUser } from '../../../core/models/user.model';
import { ContentType } from '../../../core/models/enums';
import { PermissionSet, createEmptyPermissionSet } from '../../../core/models/permission.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    RouterLink, PageHeaderComponent, StatusBadgeComponent,
    PermissionMatrixComponent, TranslatePipe
  ],
  template: `
    @if (user) {
      <app-page-header title="users.editTitle" />

      <div class="card">
        <div class="readonly-info">
          <div><label>{{ 'users.name' | translate }}</label><span>{{ getName(user) }}</span></div>
          <div><label>{{ 'users.email' | translate }}</label><span>{{ user.email }}</span></div>
          <div><label>{{ 'users.status' | translate }}</label><app-status-badge [status]="user.status" /></div>
        </div>

        <div class="content-types">
          <h4>{{ 'users.selectContentTypes' | translate }}</h4>
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
            (permissionsChange)="permissions = $event" />
        }

        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ 'common.save' | translate }}</button>
          <a [routerLink]="['/users', user.id]" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .readonly-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; cursor: pointer; }
    h4 { margin: 0 0 0.75rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class UserEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);

  user: DashboardUser | null = null;
  selectedContentTypes: ContentType[] = [];
  permissions: PermissionSet[] = [];
  readonly contentTypes = Object.values(ContentType);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.user = this.usersService.getById(id) ?? null;
    if (this.user) {
      this.permissions = Object.values(ContentType).map((ct) => {
        const existing = this.user!.permissions.find((p) => p.contentType === ct);
        return existing ?? createEmptyPermissionSet(ct);
      });
      this.selectedContentTypes = this.user.permissions.filter((p) =>
        p.canView || p.canCreate || p.canEdit || p.canDelete || p.canPublish
      ).map((p) => p.contentType);
    }
  }

  getName(user: DashboardUser): string {
    return this.language.currentLang === 'ar' ? user.fullNameAr : user.fullNameEn;
  }

  toggleContentType(ct: ContentType, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedContentTypes = [...this.selectedContentTypes, ct];
    } else {
      this.selectedContentTypes = this.selectedContentTypes.filter((c) => c !== ct);
      this.permissions = this.permissions.map((p) => p.contentType === ct ? createEmptyPermissionSet(ct) : p);
    }
  }

  save(): void {
    if (!this.user) return;
    if (!this.selectedContentTypes.length) {
      this.toast.error('validation.contentTypeRequired');
      return;
    }
    const activePerms = this.permissions.filter((p) => this.selectedContentTypes.includes(p.contentType));
    if (!activePerms.some((p) => p.canView)) {
      this.toast.error('validation.viewPermissionRequired');
      return;
    }
    this.usersService.update(this.user.id, activePerms);
    this.toast.success('messages.userUpdated');
    this.router.navigate(['/users', this.user.id]);
  }
}
