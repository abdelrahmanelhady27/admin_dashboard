import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.dev';
import {
  BehaviorSubject,
  Observable,
  tap,
  map,
  catchError,
  of,
  throwError,
  finalize,
  shareReplay,
  switchMap,
} from 'rxjs';
import {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  AuthResponse,
  RefreshTokenRequest,
} from '../models/auth.model';
import { isTokenExpired, getRolesFromToken } from '../utils/jwt.utils';
import { PermissionSet } from '../models/permission.model';
import { ContentType, AppRoles } from '../models/enums';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private readonly currentUserSubject =
    new BehaviorSubject<AuthResponse | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private readonly permissionsSubject = new BehaviorSubject<PermissionSet[]>(
    [],
  );
  readonly permissions$ = this.permissionsSubject.asObservable();

  private refreshInProgress$: Observable<AuthResponse> | null = null;
  private permissionsLoad$: Observable<PermissionSet[]> | null = null;
  private permissionsLoaded = false;

  constructor() {
    if (this.isAuthenticated && !this.isSuperAdmin) {
      this.ensurePermissionsReady().subscribe({ error: () => undefined });
    }
  }

  get isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.token) {
      return false;
    }
    if (!isTokenExpired(user.token)) {
      return true;
    }
    return !!user.refreshToken;
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  get refreshTokenValue(): string | null {
    return this.currentUserSubject.value?.refreshToken ?? null;
  }

  get isAccessTokenExpired(): boolean {
    const token = this.token;
    return !token || isTokenExpired(token);
  }

  get roles(): string[] {
    const token = this.token;
    if (!token) {
      return [];
    }
    return getRolesFromToken(token);
  }

  hasRole(roleName: string): boolean {
    return this.roles.some((r) => r.toLowerCase() === roleName.toLowerCase());
  }

  get isSuperAdmin(): boolean {
    return this.roles.includes(AppRoles.SuperAdmin);
  }

  get isAdmin(): boolean {
    return this.roles.includes(AppRoles.Admin);
  }

  get permissions(): PermissionSet[] {
    return this.permissionsSubject.value;
  }

  hasPermission(
    contentType: ContentType,
    action: 'view' | 'create' | 'edit' | 'delete' | 'publish',
  ): boolean {
    if (this.isSuperAdmin) {
      return true;
    }
    const perm = this.permissions.find(
      (p) => (p.contentType ?? p.feature) === contentType,
    );
    if (!perm) {
      return false;
    }
    switch (action) {
      case 'view':
        return perm.canView;
      case 'create':
        return perm.canCreate;
      case 'edit':
        return perm.canEdit;
      case 'delete':
        return perm.canDelete;
      case 'publish':
        return perm.canPublish;
    }
  }

  fetchPermissions(): Observable<PermissionSet[]> {
    return this.http.get<any[]>(`${this.apiUrl}/auth/my-permissions`).pipe(
      map((rawPerms) => {
        return rawPerms.map((raw) => {
          const contentType = this.mapFeatureToContentType(
            raw.feature ?? raw.contentType,
          );
          return {
            contentType: contentType,
            feature: contentType,
            canView: !!raw.canView,
            canCreate: !!raw.canCreate,
            canEdit: !!raw.canEdit,
            canDelete: !!raw.canDelete,
            canPublish: !!raw.canPublish,
          } as PermissionSet;
        });
      }),
      tap((perms) => {
        this.permissionsSubject.next(perms);
        this.permissionsLoaded = true;
      }),
    );
  }

  ensurePermissionsReady(): Observable<PermissionSet[]> {
    if (this.isSuperAdmin || !this.isAuthenticated) {
      return of([]);
    }

    if (this.permissionsLoaded) {
      return of(this.permissionsSubject.value);
    }

    if (this.permissionsLoad$) {
      return this.permissionsLoad$;
    }

    const refreshIfNeeded$ =
      this.isAccessTokenExpired && this.refreshTokenValue
        ? this.refreshToken().pipe(map(() => void 0))
        : of(void 0);

    this.permissionsLoad$ = refreshIfNeeded$.pipe(
      switchMap(() => {
        if (this.isSuperAdmin || !this.isAuthenticated) {
          return of([] as PermissionSet[]);
        }
        return this.fetchPermissions();
      }),
      catchError((err) => {
        this.permissionsLoad$ = null;
        return throwError(() => err);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.permissionsLoad$;
  }

  private mapFeatureToContentType(feature: any): ContentType | undefined {
    if (feature === 1 || feature === '1' || feature === 'ServiceIntroPage')
      return ContentType.ServiceIntroPage;
    if (feature === 2 || feature === '2' || feature === 'QuickLinks')
      return ContentType.QuickLinks;
    if (feature === 3 || feature === '3' || feature === 'EmployeeNews')
      return ContentType.EmployeeNews;
    if (feature === 4 || feature === '4' || feature === 'AuditLog')
      return ContentType.AuditLog;
    return undefined;
  }

  login(credintials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, credintials)
      .pipe(
        map((response) => this.normalizeAuthResponse(response)),
        tap((response) => this.saveUser(response)),
      );
  }

  register(credintials: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/auth/register`,
      credintials,
    );
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }

    const refreshToken = this.refreshTokenValue;
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const body: RefreshTokenRequest = { refreshToken };
    this.refreshInProgress$ = this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh-token`, body)
      .pipe(
        map((response) => this.normalizeAuthResponse(response)),
        tap((response) => {
          if (!response.token || !response.refreshToken) {
            throw new Error('Invalid refresh response');
          }
          this.saveUser(response);
        }),
        finalize(() => {
          this.refreshInProgress$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.refreshInProgress$;
  }

  logout(): void {
    const refreshToken = this.refreshTokenValue;
    this.clearSession();

    if (refreshToken) {
      const body: RefreshTokenRequest = { refreshToken };
      this.http
        .post(`${this.apiUrl}/auth/logout`, body)
        .pipe(catchError(() => of(null)))
        .subscribe();
    }
  }

  clearSession(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.permissionsSubject.next([]);
    this.permissionsLoaded = false;
    this.permissionsLoad$ = null;
    this.refreshInProgress$ = null;
  }

  private saveUser(user: AuthResponse): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) {
      return null;
    }
    try {
      return this.normalizeAuthResponse(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  /** Accept camelCase or PascalCase payloads from the API / localStorage. */
  private normalizeAuthResponse(raw: any): AuthResponse {
    return {
      fullName: raw?.fullName ?? raw?.FullName ?? '',
      email: raw?.email ?? raw?.Email ?? '',
      token: raw?.token ?? raw?.Token ?? '',
      refreshToken: raw?.refreshToken ?? raw?.RefreshToken ?? '',
    };
  }
}
