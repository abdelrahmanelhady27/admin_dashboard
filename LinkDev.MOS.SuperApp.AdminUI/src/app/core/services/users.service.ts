import { Injectable } from '@angular/core';
import { DashboardUser } from '../models/user.model';
import { ContentType, UserStatus, AuditAction } from '../models/enums';
import { PermissionSet } from '../models/permission.model';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuditLogService } from './audit-log.service';
import { MockAuthService } from './mock-auth.service';

export interface UserFilter {
  search?: string;
  status?: UserStatus | '';
  contentType?: ContentType | '';
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private users: DashboardUser[] = [];

  constructor(
    private readonly auditLog: AuditLogService,
    private readonly auth: MockAuthService
  ) {
    this.load();
  }

  getAll(filter?: UserFilter): DashboardUser[] {
    let result = [...this.users];
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullNameAr.toLowerCase().includes(term) ||
          u.fullNameEn.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      );
    }
    if (filter?.status) {
      result = result.filter((u) => u.status === filter.status);
    }
    if (filter?.contentType) {
      result = result.filter((u) =>
        u.permissions.some((p) => p.contentType === filter.contentType && p.canView)
      );
    }
    return result.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  }

  getById(id: string): DashboardUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  existsByDirectoryUserId(directoryUserId: string): boolean {
    return this.users.some((u) => u.directoryUserId === directoryUserId);
  }

  getCount(): number {
    return this.users.length;
  }

  create(user: Omit<DashboardUser, 'id' | 'createdAt' | 'modifiedAt' | 'modifiedBy'>): DashboardUser {
    const now = new Date().toISOString();
    const created: DashboardUser = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: now,
      modifiedAt: now,
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System'
    };
    this.users.push(created);
    this.persist();
    this.auditLog.log(AuditAction.AddUser, 'User', created.fullNameEn);
    return created;
  }

  update(id: string, permissions: PermissionSet[]): DashboardUser | null {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      return null;
    }
    this.users[index] = {
      ...this.users[index],
      permissions,
      modifiedAt: new Date().toISOString(),
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System'
    };
    this.persist();
    this.auditLog.log(AuditAction.EditUserPermissions, 'User', this.users[index].fullNameEn);
    return this.users[index];
  }

  delete(id: string): boolean {
    const user = this.getById(id);
    if (!user) {
      return false;
    }
    this.users = this.users.filter((u) => u.id !== id);
    this.persist();
    this.auditLog.log(AuditAction.DeleteUser, 'User', user.fullNameEn);
    return true;
  }

  suspend(id: string): DashboardUser | null {
    const user = this.getById(id);
    if (!user) {
      return null;
    }
    user.status = UserStatus.Suspended;
    user.modifiedAt = new Date().toISOString();
    user.modifiedBy = this.auth.currentUser?.fullNameEn || 'System';
    this.persist();
    this.auditLog.log(AuditAction.SuspendUser, 'User', user.fullNameEn);
    return user;
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_USERS);
    this.users = raw ? JSON.parse(raw) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEYS.DASHBOARD_USERS, JSON.stringify(this.users));
  }

  static seedData(): DashboardUser[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'user-1',
        directoryUserId: 'dir-1',
        fullNameAr: 'أحمد محمد',
        fullNameEn: 'Ahmed Mohammed',
        email: 'ahmed.m@portal.local',
        status: UserStatus.Active,
        permissions: [
          { contentType: ContentType.ServicePages, canView: true, canCreate: true, canEdit: true, canDelete: false, canPublish: true },
          { contentType: ContentType.EmployeeNews, canView: true, canCreate: true, canEdit: true, canDelete: true, canPublish: true }
        ],
        createdAt: now,
        modifiedAt: now,
        modifiedBy: 'System Administrator'
      },
      {
        id: 'user-2',
        directoryUserId: 'dir-2',
        fullNameAr: 'سارة علي',
        fullNameEn: 'Sara Ali',
        email: 'sara.a@portal.local',
        status: UserStatus.Active,
        permissions: [
          { contentType: ContentType.QuickLinks, canView: true, canCreate: true, canEdit: true, canDelete: true, canPublish: false },
          { contentType: ContentType.GeneralContent, canView: true, canCreate: false, canEdit: false, canDelete: false, canPublish: false }
        ],
        createdAt: now,
        modifiedAt: now,
        modifiedBy: 'System Administrator'
      }
    ];
  }
}
