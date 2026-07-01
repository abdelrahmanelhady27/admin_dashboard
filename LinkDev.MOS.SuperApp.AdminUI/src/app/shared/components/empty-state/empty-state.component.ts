import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <img src="assets/images/empty-state.svg" alt="" />
      </div>
      <h3 class="empty-state__title">{{ message | translate }}</h3>
      @if (hint) {
        <p class="empty-state__hint">{{ hint | translate }}</p>
      }
      <div class="empty-state__actions"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center; padding: 3.5rem 1.5rem;
      background: var(--card-bg); border-radius: var(--radius-lg);
      border: 1px dashed var(--border-color);
    }
    .empty-state__icon img { width: 100px; height: auto; opacity: 0.7; margin-bottom: 1.25rem; }
    .empty-state__title { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; color: var(--text-dark); }
    .empty-state__hint { margin: 0 0 1.25rem; font-size: 0.8125rem; color: var(--text-muted); }
    .empty-state__actions { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
  `]
})
export class EmptyStateComponent {
  @Input({ required: true }) message!: string;
  @Input() hint = '';
}
