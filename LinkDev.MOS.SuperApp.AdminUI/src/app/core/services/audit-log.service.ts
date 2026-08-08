import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface AuditLogFilter extends PagedRequest {
  search?: string;
  actionType?: string;
  entityType?: string;
  from?: string;
  to?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit-log`;

  getAll(filter?: AuditLogFilter): Observable<PagedResult<AuditLog>> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.actionType) {
      params = params.set('actionType', filter.actionType);
    }
    if (filter?.entityType) {
      params = params.set('entityType', filter.entityType);
    }
    if (filter?.from) {
      params = params.set('from', filter.from);
    }
    if (filter?.to) {
      params = params.set('to', filter.to);
    }
    params = params.set('pageNumber', String(filter?.pageNumber ?? 1));
    params = params.set('pageSize', String(filter?.pageSize ?? 10));
    if (filter?.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter?.sortDescending !== undefined) {
      params = params.set('sortDescending', String(filter.sortDescending));
    }
    return this.http.get<PagedResult<AuditLog>>(this.apiUrl, { params });
  }

  getRecent(limit = 5): Observable<AuditLog[]> {
    const size = Math.max(1, limit);
    return this.getAll({ pageNumber: 1, pageSize: size }).pipe(
      map((result) => (result.items ?? []).slice(0, size))
    );
  }
}
