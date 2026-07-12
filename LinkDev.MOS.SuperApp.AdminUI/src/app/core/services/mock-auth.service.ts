import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '../models/user.model';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class MockAuthService {
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  login(email: string, _password: string): boolean {
    const user: AuthUser = {
      id: 'auth-admin-1',
      email: email || 'admin@portal.local',
      fullNameEn: 'System Administrator',
      isAdmin: true
    };
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return true;
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.currentUserSubject.next(null);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
