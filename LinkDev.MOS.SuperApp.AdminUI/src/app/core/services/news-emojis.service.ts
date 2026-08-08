import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewsEmoji } from '../models/employee-news.model';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface NewsEmojiFilter extends PagedRequest {
  search?: string;
  isActive?: boolean | null;
}

export interface CreateNewsEmojiRequest {
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateNewsEmojiRequest {
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
}

const LOOKUP_PAGE_SIZE = 1000;

@Injectable({ providedIn: 'root' })
export class NewsEmojisService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/news-emojis`;

  getAll(filter?: NewsEmojiFilter): Observable<PagedResult<NewsEmoji>> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.isActive === true || filter?.isActive === false) {
      params = params.set('isActive', String(filter.isActive));
    }
    params = params.set('pageNumber', String(filter?.pageNumber ?? 1));
    params = params.set('pageSize', String(filter?.pageSize ?? 10));
    params = params.set('sortBy', filter?.sortBy ?? 'displayOrder');
    params = params.set('sortDescending', String(filter?.sortDescending ?? false));
    return this.http.get<PagedResult<NewsEmoji>>(this.apiUrl, { params });
  }

  /** Convenience for dropdowns / display-order calc — same GetAll endpoint. */
  getLookup(activeOnly = false): Observable<NewsEmoji[]> {
    return this.getAll({
      isActive: activeOnly ? true : null,
      pageNumber: 1,
      pageSize: LOOKUP_PAGE_SIZE,
      sortBy: 'displayOrder',
      sortDescending: false
    }).pipe(map((result) => result.items ?? []));
  }

  getById(id: number): Observable<NewsEmoji> {
    return this.http.get<NewsEmoji>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateNewsEmojiRequest): Observable<NewsEmoji> {
    return this.http.post<NewsEmoji>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateNewsEmojiRequest): Observable<NewsEmoji> {
    return this.http.put<NewsEmoji>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
