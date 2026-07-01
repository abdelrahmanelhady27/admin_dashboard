import { Component, HostListener, inject } from '@angular/core';
import { LanguageService, AppLanguage } from '../../../core/services/language.service';

interface LangOption {
  code: AppLanguage;
  label: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="lang-switcher" [class.open]="isOpen">
      <button type="button" class="lang-switcher__trigger" (click)="toggle()" [attr.aria-expanded]="isOpen">
        <svg class="lang-switcher__globe" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span class="lang-switcher__current">{{ currentLabel }}</span>
        <svg class="lang-switcher__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      @if (isOpen) {
        <div class="lang-switcher__dropdown">
          @for (opt of options; track opt.code) {
            <button
              type="button"
              class="lang-switcher__option"
              [class.active]="language.currentLang === opt.code"
              (click)="select(opt.code)">
              {{ opt.label }}
              @if (language.currentLang === opt.code) {
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lang-switcher { position: relative; }
    .lang-switcher__trigger {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4375rem 0.75rem;
      background: var(--page-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--text-dark);
      transition: all var(--transition-fast);
    }
    .lang-switcher__trigger:hover {
      border-color: var(--primary-color);
      background: var(--primary-light);
    }
    .lang-switcher.open .lang-switcher__trigger {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(1, 170, 78, 0.12);
    }
    .lang-switcher__globe { width: 16px; height: 16px; color: var(--primary-color); flex-shrink: 0; }
    .lang-switcher__chevron { width: 14px; height: 14px; color: var(--text-muted); transition: transform var(--transition-fast); }
    .lang-switcher.open .lang-switcher__chevron { transform: rotate(180deg); }
    .lang-switcher__current { white-space: nowrap; }
    .lang-switcher__dropdown {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-end: 0;
      min-width: 140px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      padding: 0.375rem;
      z-index: 300;
      animation: fadeInUp 0.2s ease;
    }
    .lang-switcher__option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 0.5625rem 0.75rem;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.8125rem;
      color: var(--text-dark);
      transition: background var(--transition-fast);
      text-align: start;
    }
    .lang-switcher__option:hover { background: var(--page-bg); }
    .lang-switcher__option.active {
      background: var(--primary-light);
      color: var(--primary-color);
      font-weight: 600;
    }
    .check { width: 14px; height: 14px; }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 767px) {
      .lang-switcher__current { display: none; }
      .lang-switcher__trigger { padding: 0.4375rem; gap: 0; }
      .lang-switcher__chevron { display: none; }
    }
  `]
})
export class LanguageSwitcherComponent {
  readonly language = inject(LanguageService);
  isOpen = false;

  readonly options: LangOption[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'en', label: 'English' }
  ];

  get currentLabel(): string {
    return this.options.find((o) => o.code === this.language.currentLang)?.label ?? 'English';
  }

  toggle(): void { this.isOpen = !this.isOpen; }

  select(code: AppLanguage): void {
    this.language.setLanguage(code);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.lang-switcher')) {
      this.isOpen = false;
    }
  }
}
