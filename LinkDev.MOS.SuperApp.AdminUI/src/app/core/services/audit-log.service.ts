import { Injectable } from '@angular/core';
import { AuditLog } from '../models/audit-log.model';
import { AuditAction } from '../models/enums';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { MockAuthService } from './mock-auth.service';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private logs: AuditLog[] = [];

  constructor(private readonly auth: MockAuthService) {
    this.load();
  }

  getAll(): AuditLog[] {
    return [...this.logs].sort(
      (a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()
    );
  }

  getRecent(limit = 10): AuditLog[] {
    return this.getAll().slice(0, limit);
  }

  log(action: AuditAction, entityType: string, entityName: string, performedBy?: string): AuditLog {
    const entry: AuditLog = {
      id: `audit-${Date.now()}`,
      action,
      entityType,
      entityName,
      performedBy: performedBy || this.auth.currentUser?.fullNameEn || 'System',
      performedAt: new Date().toISOString()
    };
    this.logs.unshift(entry);
    this.persist();
    return entry;
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    this.logs = raw ? JSON.parse(raw) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.logs));
  }

  static seedData(): AuditLog[] {
    const now = Date.now();
    return [
      {
        id: 'audit-seed-1',
        action: AuditAction.AddUser,
        entityType: 'User',
        entityName: 'Ahmed Mohammed',
        performedBy: 'System Administrator',
        performedAt: new Date(now - 86400000 * 5).toISOString()
      },
      {
        id: 'audit-seed-2',
        action: AuditAction.PublishServicePage,
        entityType: 'ServicePage',
        entityName: 'Service A1',
        performedBy: 'System Administrator',
        performedAt: new Date(now - 86400000 * 3).toISOString()
      },
      {
        id: 'audit-seed-3',
        action: AuditAction.CreateNews,
        entityType: 'EmployeeNews',
        entityName: 'Team Achievement Update',
        performedBy: 'System Administrator',
        performedAt: new Date(now - 86400000 * 2).toISOString()
      }
    ];
  }
}
