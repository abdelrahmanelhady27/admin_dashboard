import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmployeeNews, NewsAttachment } from '../models/employee-news.model';
import { NewsStatus } from '../models/enums';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface NewsFilter extends PagedRequest {
  search?: string;
  status?: NewsStatus | '';
  categoryId?: number | null;
}

export interface CreateEmployeeNewsRequest {
  title: string;
  content: string;
  categoryId?: number | null;
  imageUrl?: string | null;
  imageFileName?: string | null;
  attachments: NewsAttachment[];
  publish: boolean;
}

export interface UpdateEmployeeNewsRequest {
  title: string;
  content: string;
  categoryId?: number | null;
  imageUrl?: string | null;
  imageFileName?: string | null;
  attachments: NewsAttachment[];
  saveAsDraft?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmployeeNewsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/employee-news`;

  getAll(filter?: NewsFilter): Observable<PagedResult<EmployeeNews>> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    if (filter?.categoryId) {
      params = params.set('categoryId', String(filter.categoryId));
    }
    params = params.set('pageNumber', String(filter?.pageNumber ?? 1));
    params = params.set('pageSize', String(filter?.pageSize ?? 10));
    if (filter?.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter?.sortDescending !== undefined) {
      params = params.set('sortDescending', String(filter.sortDescending));
    }
    return this.http.get<PagedResult<EmployeeNews>>(this.apiUrl, { params }).pipe(
      map((result) => ({
        ...result,
        items: (result.items ?? []).map(normalizeNews)
      }))
    );
  }

  getById(id: number): Observable<EmployeeNews> {
    return this.http.get<EmployeeNews>(`${this.apiUrl}/${id}`).pipe(map(normalizeNews));
  }

  create(dto: CreateEmployeeNewsRequest): Observable<EmployeeNews> {
    return this.http
      .post<EmployeeNews>(this.apiUrl, {
        title: dto.title,
        content: dto.content,
        categoryId: dto.categoryId ?? null,
        imageUrl: dto.imageUrl || null,
        imageFileName: dto.imageFileName || null,
        attachments: serializeAttachments(dto.attachments),
        publish: dto.publish
      })
      .pipe(map(normalizeNews));
  }

  update(id: number, dto: UpdateEmployeeNewsRequest): Observable<EmployeeNews> {
    return this.http
      .put<EmployeeNews>(`${this.apiUrl}/${id}`, {
        title: dto.title,
        content: dto.content,
        categoryId: dto.categoryId ?? null,
        imageUrl: dto.imageUrl || null,
        imageFileName: dto.imageFileName || null,
        attachments: serializeAttachments(dto.attachments),
        saveAsDraft: !!dto.saveAsDraft
      })
      .pipe(map(normalizeNews));
  }

  publish(id: number): Observable<EmployeeNews> {
    return this.http.post<EmployeeNews>(`${this.apiUrl}/${id}/publish`, {}).pipe(map(normalizeNews));
  }

  unpublish(id: number): Observable<EmployeeNews> {
    return this.http.post<EmployeeNews>(`${this.apiUrl}/${id}/unpublish`, {}).pipe(map(normalizeNews));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

function normalizeNews(item: EmployeeNews): EmployeeNews {
  return {
    ...item,
    attachments: item.attachments ?? [],
    status: item.status as NewsStatus
  };
}

function serializeAttachments(attachments: NewsAttachment[]) {
  return (attachments ?? [])
    .filter((a) => !!a.name?.trim())
    .map((a) => ({
      id: typeof a.id === 'number' && a.id > 0 ? a.id : 0,
      name: a.name.trim(),
      fileUrl: a.fileUrl || null,
      fileName: a.fileName || null,
      fileType: a.fileType || null
    }));
}
