import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { ServicePagesService } from './service-pages.service';
import { QuickLinksService } from './quick-links.service';
import { EmployeeNewsService } from './employee-news.service';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  seedIfNeeded(): void {
    if (localStorage.getItem(STORAGE_KEYS.SEEDED) === 'true') {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.SYSTEMS, JSON.stringify(ServicePagesService.seedSystems()));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(ServicePagesService.seedServices()));
    localStorage.setItem(STORAGE_KEYS.SERVICE_PAGES, JSON.stringify(ServicePagesService.seedPages()));
    localStorage.setItem(STORAGE_KEYS.QUICK_LINKS, JSON.stringify(QuickLinksService.seedData()));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_NEWS, JSON.stringify(EmployeeNewsService.seedData()));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }
}
