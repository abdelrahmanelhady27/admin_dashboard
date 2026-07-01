import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <span class="status-badge" [class]="'status-' + status.toLowerCase()" [class.size-sm]="size === 'sm'">
      {{ 'status.' + status | translate }}
    </span>
  `,
  styles: [`
    .status-badge {
      display: inline-flex; align-items: center; padding: 0.25rem 0.6875rem;
      border-radius: 999px; font-size: 0.75rem; font-weight: 600; line-height: 1.3;
      animation: badgePop 0.3s ease;
    }
    .size-sm { font-size: 0.6875rem; padding: 0.125rem 0.5rem; }
    .status-active, .status-published, .status-approved { background: var(--primary-light); color: var(--success-color); }
    .status-inactive, .status-unpublished, .status-closed { background: #F3F4F6; color: var(--text-muted); }
    .status-suspended, .status-rejected, .status-deleted { background: var(--danger-light); color: var(--danger-color); }
    .status-draft, .status-pending { background: var(--warning-light); color: var(--warning-color); }
    @keyframes badgePop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class StatusBadgeComponent {
  @Input({ required: true }) status!: string;
  @Input() size: 'sm' | 'md' = 'md';
}
