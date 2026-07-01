import { Injectable } from '@angular/core';
import { DirectoryUser } from '../models/user.model';
import { UserStatus } from '../models/enums';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class MockDirectoryService {
  private directoryUsers: DirectoryUser[] = [];

  constructor() {
    this.load();
  }

  search(term: string): DirectoryUser[] {
    const normalized = term.trim().toLowerCase();
    if (!normalized) {
      return [];
    }
    return this.directoryUsers.filter(
      (user) =>
        user.fullNameAr.toLowerCase().includes(normalized) ||
        user.fullNameEn.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
    );
  }

  getById(id: string): DirectoryUser | undefined {
    return this.directoryUsers.find((user) => user.id === id);
  }

  getAll(): DirectoryUser[] {
    return [...this.directoryUsers];
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.DIRECTORY_USERS);
    this.directoryUsers = raw ? JSON.parse(raw) : [];
  }

  static seedData(): DirectoryUser[] {
    return [
      {
        id: 'dir-1',
        fullNameAr: 'أحمد محمد',
        fullNameEn: 'Ahmed Mohammed',
        email: 'ahmed.m@portal.local',
        status: UserStatus.Active
      },
      {
        id: 'dir-2',
        fullNameAr: 'سارة علي',
        fullNameEn: 'Sara Ali',
        email: 'sara.a@portal.local',
        status: UserStatus.Active
      },
      {
        id: 'dir-3',
        fullNameAr: 'خالد يوسف',
        fullNameEn: 'Khaled Youssef',
        email: 'khaled.y@portal.local',
        status: UserStatus.Inactive
      }
    ];
  }
}
