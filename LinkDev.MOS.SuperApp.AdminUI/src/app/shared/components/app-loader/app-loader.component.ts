import { Component, Input, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [AsyncPipe, TranslatePipe],
  template: `
    @if (loader.loading$ | async) {
      @if (topBar) {
        <div class="loader-topbar">
          <div class="loader-topbar__track">
            <div class="loader-topbar__bar" [style.width.%]="loader.progress$ | async"></div>
          </div>
        </div>
      }

      @if (fullScreen && (loader.showOverlay$ | async)) {
        <div class="loader-overlay" [class.loader-overlay--visible]="loader.showOverlay$ | async">
          <div class="loader-overlay__content">
            <img src="assets/images/logo.svg" alt="" class="loader-overlay__logo" />
            <div class="loader-overlay__spinner"></div>
            @if (showText) {
              <p class="loader-overlay__text">{{ 'common.loading' | translate }}</p>
            }
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .loader-topbar {
      position: fixed;
      top: 0;
      inset-inline: 0;
      z-index: 9999;
      height: 3px;
      pointer-events: none;
    }
    .loader-topbar__track {
      height: 100%;
      background: rgba(1, 170, 78, 0.12);
      overflow: hidden;
    }
    .loader-topbar__bar {
      height: 100%;
      background: var(--primary-gradient);
      transition: width 0.3s ease;
      box-shadow: 0 0 8px rgba(1, 170, 78, 0.4);
      border-radius: 0 2px 2px 0;
    }
    .loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(248, 250, 252, 0.75);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity var(--transition-base);
      pointer-events: none;
    }
    .loader-overlay--visible {
      opacity: 1;
      pointer-events: auto;
    }
    .loader-overlay__content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      animation: scaleIn 0.3s ease;
    }
    .loader-overlay__logo {
      width: 48px;
      height: 48px;
      animation: loaderPulse 1.2s ease infinite;
    }
    .loader-overlay__spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--primary-light);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    .loader-overlay__text {
      margin: 0;
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes loaderPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }
    @media (max-width: 768px) {
      .loader-overlay__logo { width: 40px; height: 40px; }
      .loader-overlay__spinner { width: 28px; height: 28px; }
      .loader-overlay__text { font-size: 0.8125rem; }
    }
  `]
})
export class AppLoaderComponent {
  readonly loader = inject(LoaderService);

  @Input() topBar = true;
  @Input() fullScreen = true;
  @Input() showText = true;
}
