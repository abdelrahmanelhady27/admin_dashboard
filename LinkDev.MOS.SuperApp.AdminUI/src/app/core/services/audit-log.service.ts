import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { environment } from '../../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit-log`;

  getAll(filter?: {
    search?: string;
    actionType?: string;
    entityType?: string;
    from?: string;
    to?: string;
  }): Observable<AuditLog[]> {
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
    return this.http.get<AuditLog[]>(this.apiUrl, { params });
  }

  getRecent(limit = 10): Observable<AuditLog[]> {
    return this.getAll().pipe(map((logs) => logs.slice(0, limit)));
  }
}
