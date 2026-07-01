import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ToastService, ToastType } from '../../../core/services/toast.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [AsyncPipe, TranslatePipe],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts$ | async; track toast.id) {
        <div class="toast-item toast-item--{{ toast.type }}" role="alert">
          <span class="toast-item__icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-item__message">{{ toast.messageKey | translate: toast.params }}</span>
          <button type="button" class="toast-item__close" (click)="toastService.remove(toast.id)" aria-label="Close">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: calc(var(--topbar-height) + 0.75rem);
      inset-inline-end: 1.25rem;
      z-index: 1200;
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      max-width: 380px;
      width: calc(100% - 2.5rem);
      pointer-events: none;
    }
    .toast-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: 0.8125rem;
      line-height: 1.4;
      pointer-events: auto;
      animation: slideInToast 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid transparent;
      backdrop-filter: blur(8px);
    }
    .toast-item--success { background: rgba(234, 248, 240, 0.95); color: #065F46; border-color: rgba(1, 170, 78, 0.2); }
    .toast-item--error { background: rgba(254, 226, 226, 0.95); color: #991B1B; border-color: rgba(220, 38, 38, 0.2); }
    .toast-item--warning { background: rgba(254, 243, 199, 0.95); color: #92400E; border-color: rgba(245, 158, 11, 0.2); }
    .toast-item--info { background: rgba(219, 234, 254, 0.95); color: #1E40AF; border-color: rgba(37, 99, 235, 0.2); }
    .toast-item__icon { font-size: 1rem; flex-shrink: 0; line-height: 1.4; }
    .toast-item__message { flex: 1; font-weight: 500; }
    .toast-item__close {
      background: none; border: none; cursor: pointer; opacity: 0.5;
      font-size: 0.75rem; padding: 0.125rem; line-height: 1; flex-shrink: 0;
      transition: opacity var(--transition-fast);
    }
    .toast-item__close:hover { opacity: 1; }
    @keyframes slideInToast {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    [dir="rtl"] .toast-item { animation-name: slideInToastRtl; }
    @keyframes slideInToastRtl {
      from { opacity: 0; transform: translateX(-100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    @media (max-width: 768px) {
      .toast-container {
        top: calc(var(--topbar-height) + 0.5rem);
        inset-inline-end: 0.75rem;
        inset-inline-start: 0.75rem;
        max-width: none;
        width: auto;
      }
      .toast-item { font-size: 0.75rem; padding: 0.75rem 0.875rem; }
    }
  `]
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return icons[type];
  }
}
