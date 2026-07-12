import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { DashboardUser } from '../../../core/models/user.model';
import { ContentType, UserStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PermissionMatrixComponent } from '../../../shared/components/permission-matrix/permission-matrix.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent,
    PermissionMatrixComponent, ConfirmDialogComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    @if (loading) {
      <app-skeleton height="2rem" width="200px" />
      <div class="u-card" style="padding:1.5rem;margin-top:1.25rem">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem">
          @for (i of [1,2,3,4,5,6]; track i) { <app-skeleton height="48px" /> }
        </div>
        <div style="margin-top:1.5rem"><app-skeleton height="120px" /></div>
      </div>
    } @else if (user) {
      <app-page-header title="users.detailsTitle">
        <a routerLink="/users" class="btn btn-outline">{{ 'common.back' | translate }}</a>
        <a [routerLink]="['/users', user.id, 'edit']" class="btn btn-primary">{{ 'common.edit' | translate }}</a>
        <button type="button" class="btn btn-outline" (click)="showDeleteConfirm = true">{{ 'common.delete' | translate }}</button>
        @if (user.status !== suspendedStatus) {
          <button type="button" class="btn btn-outline" (click)="showSuspendConfirm = true">{{ 'common.suspend' | translate }}</button>
        }
      </app-page-header>

      <div class="u-card" style="padding:1.5rem">
        <div class="info-grid">
          <div><label>{{ 'users.name' | translate }}</label><span>{{ user.fullName }}</span></div>
          <div><label>{{ 'users.email' | translate }}</label><span>{{ user.email }}</span></div>
          <div><label>{{ 'users.status' | translate }}</label><app-status-badge [status]="user.status" /></div>
          <div><label>{{ 'users.createdAt' | translate }}</label><span>{{ user.createdAt | date:'medium' }}</span></div>
          <div><label>{{ 'users.modifiedBy' | translate }}</label><span>{{ user.modifiedBy }}</span></div>
          <div><label>{{ 'users.lastModified' | translate }}</label><span>{{ user.modifiedAt | date:'medium' }}</span></div>
        </div>

        <h3>{{ 'users.permissions' | translate }}</h3>
        <app-permission-matrix
          [permissions]="user.permissions"
          [selectedContentTypes]="allContentTypes"
          [readonly]="true" />
      </div>
    }

    <app-confirm-dialog [visible]="showDeleteConfirm" title="common.confirm" message="users.confirmDelete" variant="danger"
      (confirmed)="deleteUser()" (cancelled)="showDeleteConfirm = false" />
    <app-confirm-dialog [visible]="showSuspendConfirm" title="common.confirm" message="users.confirmSuspend" variant="danger"
      (confirmed)="suspendUser()" (cancelled)="showSuspendConfirm = false" />
  `,
  styles: [`
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    h3 { margin: 1.5rem 0 1rem; font-size: 1rem; font-weight: 600; }
    @media (max-width: 767px) {
      .info-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class UserDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);

  user: DashboardUser | null = null;
  loading = true;
  showDeleteConfirm = false;
  showSuspendConfirm = false;
  readonly suspendedStatus = UserStatus.Suspended;
  readonly allContentTypes = Object.values(ContentType);

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.usersService.getById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toast.error('common.error');
      }
    });
  }

  deleteUser(): void {
    if (this.user) {
      this.usersService.delete(this.user.id).subscribe({
        next: () => {
          this.toast.success('messages.userDeleted');
          this.router.navigate(['/users']);
        },
        error: () => this.toast.error('common.error')
      });
    }
    this.showDeleteConfirm = false;
  }

  suspendUser(): void {
    if (this.user) {
      this.usersService.suspend(this.user.id).subscribe({
        next: (updatedUser) => {
          this.toast.success('messages.userSuspended');
          this.user = updatedUser;
        },
        error: () => this.toast.error('common.error')
      });
    }
    this.showSuspendConfirm = false;
  }
}
