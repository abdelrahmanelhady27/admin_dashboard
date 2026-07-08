import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { LanguageService } from './core/services/language.service';
import { MockDataService } from './core/services/mock-data.service';
import { jwtInterceptor } from './core/Interceptors/jwt.interceptor';
import { errorInterceptor } from './core/Interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withEnabledBlockingInitialNavigation()),
    provideHttpClient(
      withInterceptors([jwtInterceptor, errorInterceptor])
    ),
    provideAppInitializer(async () => {
      inject(MockDataService).seedIfNeeded();
      await inject(LanguageService).init();
    })
  ]
};
