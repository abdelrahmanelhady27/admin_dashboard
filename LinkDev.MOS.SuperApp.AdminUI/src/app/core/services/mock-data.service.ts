import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { MockDirectoryService } from './mock-directory.service';
import { UsersService } from './users.service';
import { ServicePagesService } from './service-pages.service';
import { QuickLinksService } from './quick-links.service';
import { EmployeeNewsService } from './employee-news.service';
import { AuditLogService } from './audit-log.service';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  seedIfNeeded(): void {
    if (localStorage.getItem(STORAGE_KEYS.SEEDED) === 'true') {
      return;
    }
    localStorage.setItem(STORAGE_KEYS.DIRECTORY_USERS, JSON.stringify(MockDirectoryService.seedData()));
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_USERS, JSON.stringify(UsersService.seedData()));
    localStorage.setItem(STORAGE_KEYS.SYSTEMS, JSON.stringify(ServicePagesService.seedSystems()));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(ServicePagesService.seedServices()));
    localStorage.setItem(STORAGE_KEYS.SERVICE_PAGES, JSON.stringify(ServicePagesService.seedPages()));
    localStorage.setItem(STORAGE_KEYS.QUICK_LINKS, JSON.stringify(QuickLinksService.seedData()));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEE_NEWS, JSON.stringify(EmployeeNewsService.seedData()));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(AuditLogService.seedData()));
    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  }
}
