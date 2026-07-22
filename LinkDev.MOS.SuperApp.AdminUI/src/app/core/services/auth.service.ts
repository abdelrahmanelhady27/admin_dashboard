import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';  
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth.model';
import { isTokenExpired, getRolesFromToken } from '../utils/jwt.utils';
import { PermissionSet } from '../models/permission.model';
import { ContentType } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly permissionsSubject = new BehaviorSubject<PermissionSet[]>([]);
  readonly permissions$ = this.permissionsSubject.asObservable();

  constructor() {
    if (this.isAuthenticated) {
      if (!this.isSuperAdmin) {
        this.fetchPermissions().subscribe({
          error: () => this.logout()
        });
      }
    }
  }

  get isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    if(!user || !user.token) {
      return false;
    }
    return !isTokenExpired(user.token);
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  get roles(): string[] {
    const token = this.token;
    if (!token) {
      return [];
    }
    return getRolesFromToken(token);
  }

  hasRole(roleName: string): boolean {
    return this.roles.some(r => r.toLowerCase() === roleName.toLowerCase());
  }

  get isSuperAdmin(): boolean {
    return this.roles.includes('SuperAdmin');
  }

  get isAdmin(): boolean {
    return this.roles.includes('Admin');
  }

  get permissions(): PermissionSet[] {
    return this.permissionsSubject.value;
  }

  fetchPermissions(): Observable<PermissionSet[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/my-permissions`).pipe(
      map(rawPerms => {
        return rawPerms.map(raw => {
          const contentType = this.mapFeatureToContentType(raw.feature ?? raw.contentType);
          return {
            contentType: contentType,
            feature: contentType,
            canView: !!raw.canView,
            canCreate: !!raw.canCreate,
            canEdit: !!raw.canEdit,
            canDelete: !!raw.canDelete,
            canPublish: !!raw.canPublish
          } as PermissionSet;
        });
      }),
      tap(perms => this.permissionsSubject.next(perms))
    );
  }

  private mapFeatureToContentType(feature: any): ContentType | undefined {
    if (feature === 1 || feature === '1' || feature === 'ServiceIntroPage') return ContentType.ServiceIntroPage;
    if (feature === 2 || feature === '2' || feature === 'QuickLinks') return ContentType.QuickLinks;
    if (feature === 3 || feature === '3' || feature === 'EmployeeNews') return ContentType.EmployeeNews;
    if (feature === 4 || feature === '4' || feature === 'AuditLog') return ContentType.AuditLog;
    return undefined;
  }

  // login
  login(credintials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`, credintials).pipe(
      tap(response => {
        this.saveUser(response);
      })
    );
  }

  // register
  register(credintials: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`, credintials).pipe(
      tap(response => this.saveUser(response))
    );
  }

  // logout
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.permissionsSubject.next([]);
  }

  //------------------------ Helpers ------------------------

  // save user to local storage
  private saveUser(user: AuthResponse) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // load user from local storage
  private loadUser(): AuthResponse | null {
    const user = localStorage.getItem('currentUser');
    return user ? (JSON.parse(user) as AuthResponse) : null;
  }
}
