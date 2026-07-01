import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="page-header">
      <div class="page-header__content">
        <h1 class="page-header__title">{{ title | translate }}</h1>
        @if (subtitle) {
          <p class="page-header__subtitle">{{ subtitle | translate }}</p>
        }
      </div>
      <div class="page-header__actions"><ng-content></ng-content></div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      gap: 1.25rem; margin-bottom: 1.75rem; flex-wrap: wrap;
      padding-bottom: 1.25rem; border-bottom: 1px solid var(--border-light);
    }
    .page-header__title {
      margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-dark);
      letter-spacing: -0.02em; line-height: 1.2;
    }
    .page-header__subtitle {
      margin: 0.375rem 0 0; color: var(--text-muted); font-size: 0.875rem; line-height: 1.5; max-width: 560px;
    }
    .page-header__actions { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: stretch; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; }
      .page-header__title { font-size: 1.25rem; }
      .page-header__actions { width: 100%; }
      .page-header__actions .btn { flex: 1 1 auto; min-width: 0; }
    }
    @media (max-width: 480px) {
      .page-header__actions { flex-direction: column; }
      .page-header__actions .btn { width: 100%; }
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
}
