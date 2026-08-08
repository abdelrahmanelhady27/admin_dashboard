import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardUser } from '../models/user.model';
import { ContentType, UserStatus } from '../models/enums';
import { PermissionSet } from '../models/permission.model';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

const FEATURE_TYPE_MAP: Record<number, ContentType> = {
  1: ContentType.ServiceIntroPage,
  2: ContentType.QuickLinks,
  3: ContentType.EmployeeNews,
  4: ContentType.AuditLog,
};

// Outbound: Angular string → C# integer
const CONTENT_TYPE_TO_FEATURE: Record<ContentType, number> = {
  [ContentType.ServiceIntroPage]: 1,
  [ContentType.QuickLinks]: 2,
  [ContentType.EmployeeNews]: 3,
  [ContentType.AuditLog]: 4,
};

function serializePermission(p: PermissionSet) {
  const ct = p.contentType ?? p.feature!;
  return {
    feature: CONTENT_TYPE_TO_FEATURE[ct],
    canView: p.canView,
    canCreate: p.canCreate,
    canEdit: p.canEdit,
    canDelete: p.canDelete,
    canPublish: p.canPublish,
  };
}

function normalizeUser(user: DashboardUser): DashboardUser {
  return {
    ...user,
    permissions: user.permissions.map((p) => {
      const raw = p.feature as unknown;
      const ct: ContentType =
        typeof raw === 'number'
          ? (FEATURE_TYPE_MAP[raw] ?? p.contentType!)
          : (p.contentType ?? (p.feature as ContentType));
      return { ...p, contentType: ct, feature: ct };
    }),
  };
}

export interface UserFilter extends PagedRequest {
  search?: string;
  status?: UserStatus | '';
  contentType?: ContentType | '';
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  getCount(): number {
    return 0;
  }

  getAll(filter?: UserFilter): Observable<PagedResult<DashboardUser>> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.contentType) {
      params = params.set('contentType', filter.contentType);
    }
    params = params.set('pageNumber', String(filter?.pageNumber ?? 1));
    params = params.set('pageSize', String(filter?.pageSize ?? 10));
    if (filter?.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter?.sortDescending !== undefined) {
      params = params.set('sortDescending', String(filter.sortDescending));
    }
    return this.http.get<PagedResult<DashboardUser>>(this.apiUrl, { params }).pipe(
      map((result) => ({
        ...result,
        items: (result.items ?? []).map(normalizeUser)
      }))
    );
  }

  getById(id: number): Observable<DashboardUser> {
    return this.http.get<DashboardUser>(`${this.apiUrl}/${id}`).pipe(map(normalizeUser));
  }

  create(user: {
    staticUserId: number;
    fullName: string;
    email: string;
    password: string;
    permissions: PermissionSet[];
  }): Observable<DashboardUser> {
    const payload = {
      ...user,
      permissions: user.permissions.map(serializePermission),
    };
    return this.http.post<DashboardUser>(this.apiUrl, payload).pipe(map(normalizeUser));
  }

  update(id: number, permissions: PermissionSet[]): Observable<DashboardUser> {
    return this.http.put<DashboardUser>(`${this.apiUrl}/${id}/permissions`, permissions.map(serializePermission)).pipe(map(normalizeUser));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  suspend(id: number): Observable<DashboardUser> {
    return this.http.patch<DashboardUser>(`${this.apiUrl}/${id}/suspend`, {}).pipe(map(normalizeUser));
  }

  activate(id: number): Observable<DashboardUser> {
    return this.http.patch<DashboardUser>(`${this.apiUrl}/${id}/activate`, {}).pipe(map(normalizeUser));
  }
}
