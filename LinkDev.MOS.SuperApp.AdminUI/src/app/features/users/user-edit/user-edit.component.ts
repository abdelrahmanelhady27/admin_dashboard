import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { DashboardUser } from '../../../core/models/user.model';
import { ContentType } from '../../../core/models/enums';
import { PermissionSet, createEmptyPermissionSet } from '../../../core/models/permission.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [
    PageHeaderComponent, StatusBadgeComponent,
    PermissionMatrixComponent, TranslatePipe
  ],
  template: `
    @if (user) {
      <app-page-header title="users.editTitle" />

      <div class="card">
        <div class="readonly-info">
          <div><label>{{ 'users.name' | translate }}</label><span>{{ user.fullName }}</span></div>
          <div><label>{{ 'users.email' | translate }}</label><span>{{ user.email }}</span></div>
          <div><label>{{ 'users.status' | translate }}</label><app-status-badge [status]="user.status" /></div>
        </div>

        <app-permission-matrix
          [permissions]="permissions"
          [selectedContentTypes]="allContentTypes"
          (permissionsChange)="permissions = $event" />

        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ 'common.save' | translate }}</button>
          <button type="button" class="btn btn-outline" (click)="cancel()">{{ 'common.cancel' | translate }}</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .readonly-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
  `]
})
export class UserEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  user: DashboardUser | null = null;
  permissions: PermissionSet[] = [];
  readonly allContentTypes = Object.values(ContentType);
  private readonly returnTo = this.route.snapshot.queryParamMap.get('returnTo') ?? 'details';

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.usersService.getById(id).subscribe({
      next: (data) => {
        this.user = data;
        if (this.user) {
          this.permissions = Object.values(ContentType).map((ct) => {
            const existing = this.user!.permissions.find((p) => (p.contentType ?? p.feature) === ct);
            return existing ?? createEmptyPermissionSet(ct);
          });
        }
      },
      error: () => this.toast.error('common.error')
    });
  }

  save(): void {
    if (!this.user) return;
    this.usersService.update(this.user.id, this.permissions).subscribe({
      next: () => {
        this.toast.success('messages.userUpdated');
        this.navigateBack();
      },
      error: () => this.toast.error('common.error')
    });
  }

  cancel(): void {
    this.navigateBack();
  }

  private navigateBack(): void {
    if (!this.user) return;
    if (this.returnTo === 'list') {
      this.router.navigate(['/users']);
      return;
    }
    this.router.navigate(['/users', this.user.id]);
  }
}
