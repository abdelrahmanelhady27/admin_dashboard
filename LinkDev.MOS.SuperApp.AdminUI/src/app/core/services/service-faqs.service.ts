import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceFaq } from '../models/service-page.model';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface ServiceFaqFilter extends PagedRequest {
  search?: string;
  isActive?: boolean | null;
}

export interface CreateServiceFaqRequest {
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

export interface UpdateServiceFaqRequest {
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
}

const LOOKUP_PAGE_SIZE = 1000;

@Injectable({ providedIn: 'root' })
export class ServiceFaqsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/service-faqs`;

  getAll(filter?: ServiceFaqFilter): Observable<PagedResult<ServiceFaq>> {
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
    return this.http.get<PagedResult<ServiceFaq>>(this.apiUrl, { params });
  }

  /** Convenience for dropdowns / display-order calc — same GetAll endpoint. */
  getLookup(activeOnly = false): Observable<ServiceFaq[]> {
    return this.getAll({
      isActive: activeOnly ? true : null,
      pageNumber: 1,
      pageSize: LOOKUP_PAGE_SIZE,
      sortBy: 'displayOrder',
      sortDescending: false
    }).pipe(map((result) => result.items ?? []));
  }

  getById(id: number): Observable<ServiceFaq> {
    return this.http.get<ServiceFaq>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateServiceFaqRequest): Observable<ServiceFaq> {
    return this.http.post<ServiceFaq>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateServiceFaqRequest): Observable<ServiceFaq> {
    return this.http.put<ServiceFaq>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
