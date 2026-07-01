import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { STORAGE_KEYS } from './app/core/constants/storage-keys';
import { MockDirectoryService } from './app/core/services/mock-directory.service';
import { UsersService } from './app/core/services/users.service';
import { ServicePagesService } from './app/core/services/service-pages.service';
import { QuickLinksService } from './app/core/services/quick-links.service';
import { EmployeeNewsService } from './app/core/services/employee-news.service';
import { AuditLogService } from './app/core/services/audit-log.service';

function seedMockDataIfNeeded(): void {
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

seedMockDataIfNeeded();

bootstrapApplication(AppComponent, appConfig).catch((err) => {
  console.error(err);
  document.body.innerHTML = `
    <div style="padding:2rem;font-family:Segoe UI,sans-serif;max-width:640px;margin:2rem auto;">
      <h1 style="color:#DC2626;">Failed to start Unified Admin Portal</h1>
      <p>Please ensure you are using <strong>Node.js 18+</strong> and run:</p>
      <pre style="background:#F8FAFC;padding:1rem;border-radius:8px;">npm install\nnpm start</pre>
      <p>Then open <a href="http://localhost:4200/login">http://localhost:4200/login</a></p>
      <p style="color:#6B7280;font-size:0.875rem;">Do not open index.html directly from the file explorer.</p>
      <pre style="color:#DC2626;font-size:0.8125rem;">${err?.message ?? err}</pre>
    </div>`;
});
