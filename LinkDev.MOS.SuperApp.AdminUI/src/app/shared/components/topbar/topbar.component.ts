import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

import { RouterLink } from '@angular/router';

import { MockAuthService } from '../../../core/services/mock-auth.service';

import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

import { TranslatePipe } from '../../pipes/translate.pipe';



@Component({

  selector: 'app-topbar',

  standalone: true,

  imports: [RouterLink, LanguageSwitcherComponent, TranslatePipe],

  template: `

    <header class="topbar">

      <div class="topbar-start">

        <button type="button" class="menu-btn" (click)="menuToggle.emit()" [attr.aria-label]="'sidebar.expand' | translate">

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>

        </button>

        <div class="breadcrumb">

          <span class="breadcrumb__module">{{ 'app.title' | translate }}</span>

          <svg class="breadcrumb__sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>

          <span class="breadcrumb__current" [title]="pageTitle | translate">{{ pageTitle | translate }}</span>

        </div>

      </div>

      <div class="topbar-end">

        <div class="search-box">

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>

          <input type="search" [placeholder]="'topbar.searchPlaceholder' | translate" />

        </div>

        <app-language-switcher />

        <button type="button" class="notif-btn" [title]="'topbar.notifications' | translate">

          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>

          <span class="notif-dot"></span>

        </button>

        <div class="user-menu" [class.open]="avatarOpen">

          <button type="button" class="user-menu__trigger" (click)="avatarOpen = !avatarOpen">

            <img src="assets/images/avatar-placeholder.svg" alt="" class="avatar" />

            <span class="user-name">{{ auth.currentUser?.fullNameEn ?? 'Admin' }}</span>

            <svg class="user-menu__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>

          </button>

          @if (avatarOpen) {

            <div class="user-dropdown">

              <div class="user-dropdown__info">

                <strong>{{ auth.currentUser?.fullNameEn }}</strong>

                <span>{{ auth.currentUser?.email }}</span>

              </div>

              <a routerLink="/settings" class="user-dropdown__item" (click)="avatarOpen = false">{{ 'nav.settings' | translate }}</a>

            </div>

          }

        </div>

      </div>

    </header>

  `,

  styles: [`

    .topbar {

      height: var(--topbar-height);

      display: flex;

      align-items: center;

      justify-content: space-between;

      padding: 0 clamp(0.75rem, 3vw, 1.75rem);

      background: rgba(255, 255, 255, 0.85);

      backdrop-filter: blur(12px);

      border-bottom: 1px solid var(--border-light);

      position: sticky;

      top: 0;

      z-index: 100;

      gap: 0.75rem;

      box-shadow: var(--shadow-xs);

      min-width: 0;

    }

    .topbar-start {

      display: flex;

      align-items: center;

      gap: 0.625rem;

      min-width: 0;

      flex: 1;

    }

    .menu-btn {

      display: none;

      background: none;

      border: none;

      cursor: pointer;

      color: var(--text-dark);

      padding: 0.375rem;

      border-radius: var(--radius-sm);

      flex-shrink: 0;

    }

    .menu-btn:hover { background: var(--page-bg); }

    .menu-btn svg { width: 22px; height: 22px; }

    .breadcrumb {

      display: flex;

      align-items: center;

      gap: 0.375rem;

      min-width: 0;

      flex: 1;

    }

    .breadcrumb__module {

      font-size: 0.8125rem;

      color: var(--text-muted);

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

      max-width: 140px;

    }

    .breadcrumb__sep {

      width: 14px;

      height: 14px;

      color: var(--text-light);

      flex-shrink: 0;

    }

    [dir='rtl'] .breadcrumb__sep { transform: scaleX(-1); }

    .breadcrumb__current {

      font-size: clamp(0.875rem, 2.5vw, 1rem);

      font-weight: 600;

      color: var(--text-dark);

      white-space: nowrap;

      overflow: hidden;

      text-overflow: ellipsis;

      min-width: 0;

    }

    .topbar-end {

      display: flex;

      align-items: center;

      gap: 0.5rem;

      flex-shrink: 0;

    }

    .search-box {

      position: relative;

      display: flex;

      align-items: center;

    }

    .search-box svg {

      position: absolute;

      inset-inline-start: 0.75rem;

      width: 16px;

      height: 16px;

      color: var(--text-light);

      pointer-events: none;

    }

    .search-box input {

      padding: 0.5rem 0.875rem 0.5rem 2.25rem;

      border: 1px solid var(--border-color);

      border-radius: var(--radius-md);

      font-size: 0.8125rem;

      width: clamp(140px, 18vw, 220px);

      background: var(--page-bg);

      transition: all var(--transition-fast);

    }

    [dir='rtl'] .search-box input {

      padding: 0.5rem 2.25rem 0.5rem 0.875rem;

    }

    .search-box input:focus {

      width: clamp(160px, 22vw, 260px);

      background: var(--card-bg);

      border-color: var(--primary-color);

      box-shadow: 0 0 0 3px rgba(1, 170, 78, 0.1);

      outline: none;

    }

    .notif-btn {

      position: relative;

      background: var(--page-bg);

      border: 1px solid var(--border-light);

      border-radius: var(--radius-md);

      padding: 0.4375rem;

      cursor: pointer;

      color: var(--text-muted);

      transition: all var(--transition-fast);

      display: flex;

      flex-shrink: 0;

    }

    .notif-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: var(--primary-light); }

    .notif-btn svg { width: 20px; height: 20px; }

    .notif-dot {

      position: absolute;

      top: 6px;

      inset-inline-end: 6px;

      width: 7px;

      height: 7px;

      background: var(--primary-color);

      border-radius: 50%;

      border: 1.5px solid var(--card-bg);

    }

    .user-menu { position: relative; }

    .user-menu__trigger {

      display: flex;

      align-items: center;

      gap: 0.5rem;

      padding: 0.3125rem 0.625rem 0.3125rem 0.3125rem;

      background: var(--page-bg);

      border: 1px solid var(--border-light);

      border-radius: 999px;

      cursor: pointer;

      transition: all var(--transition-fast);

      max-width: 180px;

    }

    [dir='rtl'] .user-menu__trigger {

      padding: 0.3125rem 0.3125rem 0.3125rem 0.625rem;

    }

    .user-menu__trigger:hover { border-color: var(--primary-color); box-shadow: var(--shadow-sm); }

    .user-menu__chevron { width: 14px; height: 14px; color: var(--text-muted); flex-shrink: 0; }

    .avatar { width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--primary-light); flex-shrink: 0; }

    .user-name {

      font-size: 0.8125rem;

      font-weight: 500;

      color: var(--text-dark);

      overflow: hidden;

      text-overflow: ellipsis;

      white-space: nowrap;

      min-width: 0;

    }

    .user-dropdown {

      position: absolute;

      top: calc(100% + 8px);

      inset-inline-end: 0;

      min-width: min(200px, 80vw);

      background: var(--card-bg);

      border: 1px solid var(--border-light);

      border-radius: var(--radius-md);

      box-shadow: var(--shadow-lg);

      padding: 0.375rem;

      z-index: 300;

      animation: fadeInUp 0.2s ease;

    }

    .user-dropdown__info { padding: 0.75rem; border-bottom: 1px solid var(--border-light); margin-bottom: 0.25rem; }

    .user-dropdown__info strong { display: block; font-size: 0.8125rem; color: var(--text-dark); word-break: break-word; }

    .user-dropdown__info span { font-size: 0.75rem; color: var(--text-muted); word-break: break-all; }

    .user-dropdown__item {

      display: block;

      padding: 0.5625rem 0.75rem;

      border-radius: var(--radius-sm);

      font-size: 0.8125rem;

      color: var(--text-dark);

      text-decoration: none;

      transition: background var(--transition-fast);

    }

    .user-dropdown__item:hover { background: var(--page-bg); }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }



    @media (max-width: 991px) {
      .search-box { display: none; }
    }
    @media (max-width: 767px) {
      .menu-btn { display: flex; align-items: center; justify-content: center; }

      .breadcrumb__sep { display: none; }

      .user-name { display: none; }

      .user-menu__chevron { display: none; }

      .user-menu__trigger { padding: 0.25rem; border-radius: 50%; max-width: none; }

    }

    @media (max-width: 479px) {

      .topbar { gap: 0.375rem; padding: 0 0.625rem; }

      .topbar-end { gap: 0.375rem; }

    }

  `]

})

export class TopbarComponent {

  readonly auth = inject(MockAuthService);

  @Input() pageTitle = 'nav.dashboard';

  @Input() breadcrumb = 'nav.dashboard';

  @Output() menuToggle = new EventEmitter<void>();

  avatarOpen = false;

}


