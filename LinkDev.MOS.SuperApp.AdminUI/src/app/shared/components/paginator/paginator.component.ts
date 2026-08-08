import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    @if (totalCount > 0) {
      <div class="paginator">
        <div class="paginator__info">
          {{ 'pagination.showing' | translate }}
          <strong>{{ fromItem }}-{{ toItem }}</strong>
          {{ 'pagination.of' | translate }}
          <strong>{{ totalCount }}</strong>
        </div>

        <div class="paginator__controls">
          <label class="paginator__page-size">
            <span>{{ 'pagination.rowsPerPage' | translate }}</span>
            <select
              class="form-select paginator__select"
              [ngModel]="pageSize"
              (ngModelChange)="onPageSizeSelected($event)"
            >
              @for (size of pageSizeOptions; track size) {
                <option [ngValue]="size">{{ size }}</option>
              }
            </select>
          </label>

          <button
            type="button"
            class="btn btn-outline btn-sm"
            [disabled]="pageNumber <= 1"
            (click)="goToPage(pageNumber - 1)"
          >
            {{ 'pagination.previous' | translate }}
          </button>

          <span class="paginator__page">
            {{ 'pagination.page' | translate }}
            <strong>{{ pageNumber }}</strong>
            {{ 'pagination.of' | translate }}
            <strong>{{ totalPages || 1 }}</strong>
          </span>

          <button
            type="button"
            class="btn btn-outline btn-sm"
            [disabled]="pageNumber >= totalPages"
            (click)="goToPage(pageNumber + 1)"
          >
            {{ 'pagination.next' | translate }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .paginator {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1.25rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
    }
    .paginator__info {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .paginator__controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem 0.75rem;
    }
    .paginator__page-size {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .paginator__select {
      width: auto;
      min-width: 4.5rem;
      padding: 0.35rem 0.5rem;
      font-size: 0.8125rem;
    }
    .paginator__page {
      font-size: 0.8125rem;
      color: var(--text-muted);
      padding: 0 0.25rem;
    }
  `]
})
export class PaginatorComponent {
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return this.pageSize === 0 ? 0 : Math.ceil(this.totalCount / this.pageSize);
  }

  get fromItem(): number {
    if (this.totalCount === 0) return 0;
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalCount);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageChange.emit(page);
  }

  onPageSizeSelected(value: number): void {
    if (!value || value === this.pageSize) return;
    this.pageSizeChange.emit(value);
  }
}
