import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            @for (col of columns; track col.key) {
              <th>{{ col.label }}</th>
            }
            @if (actionsTemplate) {
              <th>{{ actionsLabel }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (data.length === 0) {
            <tr><td [attr.colspan]="columns.length + (actionsTemplate ? 1 : 0)" class="no-data">{{ emptyMessage }}</td></tr>
          } @else {
            @for (row of data; track trackByFn($index, row)) {
              <tr>
                @for (col of columns; track col.key) {
                  <td>
                    @if (cellTemplate) {
                      <ng-container *ngTemplateOutlet="cellTemplate; context: { $implicit: row, column: col }"></ng-container>
                    } @else {
                      {{ row[col.key] }}
                    }
                  </td>
                }
                @if (actionsTemplate) {
                  <td>
                    <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: row }"></ng-container>
                  </td>
                }
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper { overflow-x: auto; background: var(--card-bg); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; min-width: 640px; }
    th, td { padding: 0.875rem 1rem; text-align: start; border-bottom: 1px solid var(--border-color); font-size: 0.875rem; }
    th { background: #FAFBFC; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
    tr:last-child td { border-bottom: none; }
    .no-data { text-align: center; color: var(--text-muted); padding: 2rem; }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() data: Record<string, unknown>[] = [];
  @Input() actionsLabel = '';
  @Input() emptyMessage = '';
  @Input() cellTemplate: TemplateRef<{ $implicit: Record<string, unknown>; column: TableColumn }> | null = null;
  @Input() actionsTemplate: TemplateRef<{ $implicit: Record<string, unknown> }> | null = null;
  @Input() trackBy: ((index: number, item: Record<string, unknown>) => string) | null = null;

  trackByFn(index: number, item: Record<string, unknown>): string {
    return this.trackBy ? this.trackBy(index, item) : String(item['id'] ?? index);
  }
}
