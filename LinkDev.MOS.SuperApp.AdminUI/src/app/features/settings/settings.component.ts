import { Component, inject } from '@angular/core';
import { MockAuthService } from '../../core/services/mock-auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [PageHeaderComponent, LanguageSwitcherComponent, TranslatePipe],
  template: `
    <app-page-header title="nav.settings" subtitle="settings.subtitle" />

    <div class="settings-grid">
      <div class="u-card settings-card">
        <div class="settings-card__header">
          <span class="settings-card__icon">🌐</span>
          <div>
            <h3>{{ 'settings.language' | translate }}</h3>
            <p>{{ 'settings.languageDesc' | translate }}</p>
          </div>
        </div>
        <app-language-switcher />
      </div>

      <div class="u-card settings-card">
        <div class="settings-card__header">
          <span class="settings-card__icon">👤</span>
          <div>
            <h3>{{ 'settings.account' | translate }}</h3>
            <p>{{ auth.currentUser?.email }}</p>
          </div>
        </div>
        <button type="button" class="btn btn-outline" (click)="logout()">{{ 'settings.logout' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem; }
    .settings-card { padding: 1.5rem; }
    .settings-card__header { display: flex; gap: 1rem; margin-bottom: 1.25rem; align-items: flex-start; }
    .settings-card__icon { width: 40px; height: 40px; border-radius: var(--radius-md); background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 1.125rem; flex-shrink: 0; }
    .settings-card h3 { margin: 0 0 0.25rem; font-size: 0.9375rem; font-weight: 600; }
    .settings-card p { margin: 0; font-size: 0.8125rem; color: var(--text-muted); }
  `]
})
export class SettingsComponent {
  readonly auth = inject(MockAuthService);

  logout(): void {
    this.auth.logout();
    window.location.href = '/login';
  }
}
