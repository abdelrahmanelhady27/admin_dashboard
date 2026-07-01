import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { STORAGE_KEYS } from '../constants/storage-keys';

export type AppLanguage = 'ar' | 'en';

const FALLBACK_TRANSLATIONS: Record<AppLanguage, Record<string, unknown>> = {
  en: {
    app: { title: 'Unified Admin Portal', titleAr: 'لوحة الإدارة الموحدة' },
    login: {
      subtitle: 'Sign in to the admin dashboard',
      email: 'Email',
      password: 'Password',
      submit: 'Sign In',
      hint: 'Mock login: any email and password are accepted for template purposes.'
    },
    common: { save: 'Save', cancel: 'Cancel', search: 'Search' },
    nav: { dashboard: 'Dashboard' }
  },
  ar: {
    app: { title: 'Unified Admin Portal', titleAr: 'لوحة الإدارة الموحدة' },
    login: {
      subtitle: 'تسجيل الدخول إلى لوحة الإدارة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      submit: 'تسجيل الدخول',
      hint: 'تسجيل دخول تجريبي: أي بريد وكلمة مرور مقبولة لأغراض القالب.'
    },
    common: { save: 'حفظ', cancel: 'إلغاء', search: 'بحث' },
    nav: { dashboard: 'لوحة التحكم' }
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly defaultLang: AppLanguage = this.detectBrowserLanguage();
  private translations: Record<string, unknown> = {};
  private readonly currentLangSubject = new BehaviorSubject<AppLanguage>(this.loadStoredLanguage());
  readonly currentLang$ = this.currentLangSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  get currentLang(): AppLanguage {
    return this.currentLangSubject.value;
  }

  get isRtl(): boolean {
    return this.currentLang === 'ar';
  }

  async init(): Promise<void> {
    await this.loadTranslations(this.currentLang);
    this.applyDocumentAttributes(this.currentLang);
  }

  async setLanguage(lang: AppLanguage): Promise<void> {
    if (lang === this.currentLang) {
      return;
    }
    await this.loadTranslations(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    this.currentLangSubject.next(lang);
    this.applyDocumentAttributes(lang);
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const value = this.getNestedValue(this.translations, key);
    if (typeof value !== 'string') {
      return key;
    }
    if (!params) {
      return value;
    }
    return Object.entries(params).reduce(
      (result, [paramKey, paramValue]) => result.replace(`{{${paramKey}}}`, String(paramValue)),
      value
    );
  }

  instant(key: string, params?: Record<string, string | number>): string {
    return this.translate(key, params);
  }

  private detectBrowserLanguage(): AppLanguage {
    const browserLang = (navigator.language || 'en').toLowerCase();
    return browserLang.startsWith('ar') ? 'ar' : 'en';
  }

  private loadStoredLanguage(): AppLanguage {
    const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as AppLanguage | null;
    return stored === 'ar' || stored === 'en' ? stored : this.defaultLang;
  }

  private async loadTranslations(lang: AppLanguage): Promise<void> {
    try {
      this.translations = await firstValueFrom(
        this.http.get<Record<string, unknown>>(`assets/i18n/${lang}.json`).pipe(
          catchError(() => of(FALLBACK_TRANSLATIONS[lang]))
        )
      );
    } catch {
      this.translations = FALLBACK_TRANSLATIONS[lang];
    }
  }

  private applyDocumentAttributes(lang: AppLanguage): void {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  private getNestedValue(obj: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce<unknown>((acc, part) => {
      if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  }
}
