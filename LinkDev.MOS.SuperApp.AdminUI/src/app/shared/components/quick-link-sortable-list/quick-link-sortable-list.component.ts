import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { QuickLink } from '../../../core/models/quick-link.model';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-quick-link-sortable-list',
  standalone: true,
  imports: [DragDropModule, TranslatePipe],
  template: `
    @if (links.length === 0) {
      <p class="empty">{{ 'quickLinks.noLinks' | translate }}</p>
    } @else {
      <div
        cdkDropList
        class="link-list"
        [cdkDropListDisabled]="readonly || !canReorder"
        (cdkDropListDropped)="drop($event)">
        @for (link of links; track link.serviceId) {
          <div class="link-item" cdkDrag [cdkDragDisabled]="readonly || !canReorder">
            @if (!readonly && canReorder) {
              <span class="drag-handle" cdkDragHandle aria-hidden="true">☰</span>
            }
            <div class="link-info">
              <strong>{{ getServiceName(link) }}</strong>
              <span class="deep-link">{{ link.deepLink }}</span>
            </div>
            @if (!readonly && canDelete) {
              <button type="button" class="btn btn-outline btn-sm link-delete" (click)="deleteLink(link.serviceId)">{{ 'common.delete' | translate }}</button>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .link-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .link-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      min-height: 56px;
    }
    .drag-handle {
      cursor: grab;
      color: var(--text-muted);
      font-size: 1.125rem;
      padding: 0.25rem;
      flex-shrink: 0;
      touch-action: none;
      min-width: 28px;
      text-align: center;
    }
    .link-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      min-width: 0;
    }
    .link-info strong {
      font-size: 0.8125rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .deep-link {
      font-size: 0.75rem;
      color: var(--text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .link-delete { flex-shrink: 0; }
    .empty { color: var(--text-muted); text-align: center; padding: 1rem; }
    .cdk-drag-preview { box-shadow: var(--shadow-md); }
    @media (max-width: 767px) {
      .link-item {
        flex-wrap: wrap;
        padding: 0.75rem;
        gap: 0.5rem;
      }
      .link-info {
        flex: 1 1 calc(100% - 44px);
        order: 1;
      }
      .drag-handle { order: 0; }
      .link-delete {
        order: 2;
        width: 100%;
        margin-top: 0.25rem;
      }
      .deep-link { white-space: normal; word-break: break-all; }
    }
  `]
})
export class QuickLinkSortableListComponent {
  private readonly language = inject(LanguageService);

  @Input() links: QuickLink[] = [];
  @Input() readonly = false;
  @Input() canReorder = true;
  @Input() canDelete = true;
  @Output() linksChange = new EventEmitter<QuickLink[]>();
  @Output() linkDeleted = new EventEmitter<number>();

  getServiceName(link: QuickLink): string {
    return this.language.currentLang === 'ar' ? link.serviceNameAr : link.serviceNameEn;
  }

  drop(event: CdkDragDrop<QuickLink[]>): void {
    if (this.readonly || !this.canReorder) {
      return;
    }
    const updated = [...this.links];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this.linksChange.emit(updated.map((l, i) => ({ ...l, displayOrder: i + 1 })));
  }

  deleteLink(serviceId: number): void {
    if (this.readonly || !this.canDelete) {
      return;
    }
    this.linkDeleted.emit(serviceId);
  }
}
