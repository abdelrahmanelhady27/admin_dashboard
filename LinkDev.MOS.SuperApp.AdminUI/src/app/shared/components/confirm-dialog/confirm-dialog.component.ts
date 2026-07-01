import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    @if (visible) {
      <div class="dialog-backdrop" (click)="onCancel()">
        <div class="dialog" [class.dialog--danger]="variant === 'danger'" (click)="$event.stopPropagation()">
          <div class="dialog__icon">{{ variant === 'danger' ? '⚠' : '?' }}</div>
          <h3 class="dialog__title">{{ title | translate }}</h3>
          <p class="dialog__message">{{ message | translate }}</p>
          <div class="dialog__actions">
            <button type="button" class="btn btn-outline" (click)="onCancel()">{{ cancelText | translate }}</button>
            <button type="button" [class]="variant === 'danger' ? 'btn btn-danger' : 'btn btn-primary'" (click)="onConfirm()">{{ confirmText | translate }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(17, 24, 39, 0.45);
      display: flex; align-items: center; justify-content: center; z-index: 1100; padding: 1rem;
      animation: fadeIn 0.2s ease; backdrop-filter: blur(2px);
    }
    .dialog {
      background: var(--card-bg); border-radius: var(--radius-xl); padding: 1.75rem;
      max-width: 420px; width: 100%; box-shadow: var(--shadow-lg);
      animation: scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1); text-align: center;
    }
    .dialog__icon {
      width: 48px; height: 48px; border-radius: 50%; background: var(--primary-light);
      color: var(--primary-color); display: flex; align-items: center; justify-content: center;
      font-size: 1.25rem; font-weight: 700; margin: 0 auto 1rem;
    }
    .dialog--danger .dialog__icon { background: var(--danger-light); color: var(--danger-color); }
    .dialog__title { margin: 0 0 0.5rem; color: var(--text-dark); font-size: 1.0625rem; }
    .dialog__message { margin: 0 0 1.5rem; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5; }
    .dialog__actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
    @media (max-width: 768px) {
      .dialog-backdrop { padding: 0.75rem; align-items: flex-end; }
      .dialog { max-width: none; width: 90vw; padding: 1.5rem; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
      .dialog__actions { flex-direction: column-reverse; }
      .dialog__actions .btn { width: 100%; }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'common.confirm';
  @Input() message = '';
  @Input() confirmText = 'common.confirm';
  @Input() cancelText = 'common.cancel';
  @Input() variant: 'default' | 'danger' = 'default';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void { this.confirmed.emit(); }
  onCancel(): void { this.cancelled.emit(); }
}
