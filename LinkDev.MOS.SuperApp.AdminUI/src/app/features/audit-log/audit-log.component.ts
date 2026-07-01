import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuditLogService } from '../../core/services/audit-log.service';
import { AuditLog } from '../../core/models/audit-log.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, EmptyStateComponent, SkeletonComponent, TranslatePipe],
  template: `
    <app-page-header title="nav.auditLog" subtitle="auditLog.subtitle" />

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
                <td>{{ 'auditActions.' + log.action | translate }}</td>
                <td>{{ log.entityType }}</td>
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
  loading = true;
  logs: AuditLog[] = [];

  ngOnInit(): void {
    setTimeout(() => {
      this.logs = this.auditLogService.getAll();
      this.loading = false;
    }, 350);
  }
}
