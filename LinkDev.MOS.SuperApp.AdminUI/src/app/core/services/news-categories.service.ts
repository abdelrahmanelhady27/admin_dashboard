import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NewsCategory } from '../models/employee-news.model';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface NewsCategoryFilter extends PagedRequest {
  search?: string;
  isActive?: boolean | null;
}

export interface CreateNewsCategoryRequest {
  name: string;
  displayOrder: number;
  isActive: boolean;
  emojiIds: number[];
}

export interface UpdateNewsCategoryRequest {
  name: string;
  displayOrder: number;
  isActive: boolean;
  emojiIds: number[];
}

const LOOKUP_PAGE_SIZE = 1000;

@Injectable({ providedIn: 'root' })
export class NewsCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/news-categories`;

  getAll(filter?: NewsCategoryFilter): Observable<PagedResult<NewsCategory>> {
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
    return this.http.get<PagedResult<NewsCategory>>(this.apiUrl, { params });
  }

  /** Convenience for dropdowns / display-order calc — same GetAll endpoint. */
  getLookup(activeOnly = false): Observable<NewsCategory[]> {
    return this.getAll({
      isActive: activeOnly ? true : null,
      pageNumber: 1,
      pageSize: LOOKUP_PAGE_SIZE,
      sortBy: 'displayOrder',
      sortDescending: false
    }).pipe(map((result) => result.items ?? []));
  }

  getById(id: number): Observable<NewsCategory> {
    return this.http.get<NewsCategory>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateNewsCategoryRequest): Observable<NewsCategory> {
    return this.http.post<NewsCategory>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateNewsCategoryRequest): Observable<NewsCategory> {
    return this.http.put<NewsCategory>(`${this.apiUrl}/${id}`, dto);
  }

  saveEmojis(id: number, emojiIds: number[]): Observable<NewsCategory> {
    return this.http.put<NewsCategory>(`${this.apiUrl}/${id}/emojis`, { emojiIds });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
