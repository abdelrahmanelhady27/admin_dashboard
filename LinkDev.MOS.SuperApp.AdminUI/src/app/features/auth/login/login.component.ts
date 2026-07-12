import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MockAuthService } from '../../../core/services/mock-auth.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from '../../../shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, LanguageSwitcherComponent, TranslatePipe, ToastContainerComponent],
  template: `
    <div class="login-page">
      <app-toast-container />
      <div class="login-lang">
        <app-language-switcher />
      </div>
      <div class="login-card u-card">
        <div class="login-card__brand">
          <img src="assets/images/logo.svg" alt="Logo" class="login-card__logo" />
          <h1>{{ 'app.title' | translate }}</h1>
          <p class="login-card__subtitle">{{ 'login.subtitle' | translate }}</p>
        </div>
        <img src="assets/images/main-illustration.svg" alt="" class="login-card__illustration" />
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
          @if (errorMessage) {
            <div class="login-error">
              {{ errorMessage | translate }}
            </div>
          }
          <div class="form-group">
            <label class="form-label">{{ 'login.email' | translate }} <span class="required">*</span></label>
            <input type="email" class="form-input" formControlName="email" autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'login.password' | translate }} <span class="required">*</span></label>
            <input type="password" class="form-input" formControlName="password" autocomplete="current-password" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg login-submit" [disabled]="form.invalid">
            {{ 'login.submit' | translate }}
          </button>
        </form>
        <p class="login-hint">{{ 'login.hint' | translate }}</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      background: var(--page-gradient);
      position: relative;
    }
    .login-lang {
      position: absolute;
      top: 1.25rem;
      inset-inline-end: 1.25rem;
    }
    .login-card {
      max-width: 440px;
      width: 100%;
      padding: 2rem 2rem 1.75rem;
      text-align: center;
      animation: fadeInUp 0.4s ease;
    }
    .login-card__logo { width: 52px; height: 52px; margin-bottom: 0.875rem; }
    .login-card h1 { margin: 0 0 0.25rem; font-size: 1.375rem; font-weight: 700; color: var(--text-dark); }
    .login-card__subtitle { margin: 0 0 1.25rem; color: var(--text-muted); font-size: 0.875rem; }
    .login-card__illustration { width: 100%; max-width: 260px; margin: 0 auto 1.5rem; display: block; }
    .login-form { text-align: start; }
    .login-submit { width: 100%; margin-top: 0.5rem; }
    .login-hint { margin: 1.25rem 0 0; font-size: 0.75rem; color: var(--text-light); line-height: 1.5; }
    .login-error {
      background: #fef2f2;
      border: 1px solid #fee2e2;
      color: #991b1b;
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      margin-bottom: 1.25rem;
      text-align: start;
    }
    @media (max-width: 767px) {
      .login-page { padding: 1.25rem 1rem; align-items: flex-start; padding-top: 4rem; }
      .login-card { padding: 1.5rem 1.25rem; }
      .login-card h1 { font-size: 1.125rem; }
      .login-card__illustration { max-width: 200px; margin-bottom: 1.25rem; }
    }
    @media (max-width: 479px) {
      .login-lang { top: 0.75rem; inset-inline-end: 0.75rem; }
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  errorMessage: string = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    const credintials = {
      email: this.form.value.email!,
      password: this.form.value.password!,
    }
    this.auth.login(credintials!).subscribe({
      next: (response) => {
        console.log('Login successfull', response);
        this.toast.success('login.loginSuccess');
        if (this.auth.isSuperAdmin) {
          this.router.navigate(['/dashboard']);
        } else {
          this.auth.fetchPermissions().subscribe({
            next: (perms) => {
              const firstPerm = perms.find(p => p.canView);
              if (firstPerm) {
                const route = this.getRouteFromContentType(firstPerm.contentType ?? firstPerm.feature ?? '');
                this.router.navigate([`/${route}`]);
              } else {
                this.router.navigate(['/settings']);
              }
            },
            error: () => {
              this.router.navigate(['/settings']);
            }
          });
        }
      },
      error: (err) => {
        console.log('Login failed', err);
        this.errorMessage = 'login.loginFailed';
        this.toast.error('login.loginFailed');
      }
    });
  }

  private getRouteFromContentType(type: string): string {
    switch (type) {
      case 'ServiceIntroPage': return 'service-pages';
      case 'QuickLinks': return 'quick-links';
      case 'EmployeeNews': return 'employee-news';
      case 'AuditLog': return 'audit-log';
      default: return 'settings';
    }
  }
}
