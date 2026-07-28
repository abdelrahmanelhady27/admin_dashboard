import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuditLogService } from '../../core/services/audit-log.service';
import { ToastService } from '../../core/services/toast.service';
import { AuditLog } from '../../core/models/audit-log.model';
import { AuditActionType, AuditEntityType } from '../../core/models/enums';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, PageHeaderComponent,
    EmptyStateComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.auditLog" subtitle="auditLog.subtitle" />

    <div class="filter-bar">
      <form [formGroup]="filterForm" (ngSubmit)="applyFilters()">
        <div class="filter-grid">
          <input
            class="form-input"
            formControlName="search"
            [placeholder]="'auditLog.searchPlaceholder' | translate"
          />
          <select class="form-select" formControlName="actionType">
            <option value="">{{ 'auditLog.allActions' | translate }}</option>
            @for (a of actionTypes; track a) {
              <option [value]="a">{{ 'auditActions.' + a | translate }}</option>
            }
          </select>
          <select class="form-select" formControlName="entityType">
            <option value="">{{ 'auditLog.allEntityTypes' | translate }}</option>
            @for (e of entityTypes; track e) {
              <option [value]="e">{{ 'entityTypes.' + e | translate }}</option>
            }
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
        @for (i of [1,2,3,4,5,6]; track i) {
          <app-skeleton height="48px" />
          <div style="height:0.5rem"></div>
        }
      </div>
    } @else if (logs.length === 0) {
      <app-empty-state message="auditLog.emptyState" />
    } @else {
      <div class="u-table-wrap">
        <table class="u-table">
          <thead>
            <tr>
              <th>{{ 'auditLog.action' | translate }}</th>
              <th>{{ 'auditLog.entityType' | translate }}</th>
              <th>{{ 'auditLog.entityName' | translate }}</th>
              <th>{{ 'auditLog.performedBy' | translate }}</th>
              <th>{{ 'auditLog.date' | translate }}</th>
            </tr>
          </thead>
          <tbody>
            @for (log of logs; track log.id) {
              <tr>
                <td>{{ 'auditActions.' + log.actionType | translate }}</td>
                <td>{{ 'entityTypes.' + log.entityType | translate }}</td>
                <td>{{ log.entityName }}</td>
                <td>{{ log.performedBy }}</td>
                <td>{{ log.performedAt | date:'medium' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class AuditLogComponent implements OnInit {
  private readonly auditLogService = inject(AuditLogService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  logs: AuditLog[] = [];
  readonly actionTypes = Object.values(AuditActionType);
  readonly entityTypes = Object.values(AuditEntityType);

  filterForm = this.fb.group({
    search: [''],
    actionType: [''],
    entityType: ['']
  });

  get activeFilters(): { key: string; label: string }[] {
    const chips: { key: string; label: string }[] = [];
    const v = this.filterForm.value;
    if (v.search) chips.push({ key: 'search', label: v.search });
    if (v.actionType) chips.push({ key: 'actionType', label: v.actionType });
    if (v.entityType) chips.push({ key: 'entityType', label: v.entityType });
    return chips;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    const v = this.filterForm.value;
    this.auditLogService.getAll({
      search: v.search || undefined,
      actionType: v.actionType || undefined,
      entityType: v.entityType || undefined
    }).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.loading = false;
      },
      error: () => {
        this.logs = [];
        this.loading = false;
        this.toast.error('common.error');
      }
    });
  }

  applyFilters(): void {
    this.load();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', actionType: '', entityType: '' });
    this.load();
  }

  removeFilter(key: string): void {
    this.filterForm.patchValue({ [key]: '' });
    this.load();
  }
}
