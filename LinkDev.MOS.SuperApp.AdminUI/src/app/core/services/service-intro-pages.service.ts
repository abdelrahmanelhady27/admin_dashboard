import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AvailableLinkedService,
  ServiceDocument,
  ServiceFaq,
  ServiceIntroPage
} from '../models/service-page.model';
import { PageStatus } from '../models/enums';
import { PagedRequest, PagedResult } from '../models/paged-result.model';
import { environment } from '../../../environments/environment.dev';

export interface ServiceIntroPageFilter extends PagedRequest {
  search?: string;
  status?: PageStatus | '';
}

export interface CreateServiceIntroPageRequest {
  serviceId: number;
  description: string;
  processingDuration: string;
  videoUrl?: string | null;
  videoFileName?: string | null;
  documents: ServiceDocument[];
  faqIds: number[];
  publish: boolean;
}

export interface UpdateServiceIntroPageRequest {
  description: string;
  processingDuration: string;
  videoUrl?: string | null;
  videoFileName?: string | null;
  documents: ServiceDocument[];
  faqIds: number[];
}

@Injectable({ providedIn: 'root' })
export class ServiceIntroPagesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/service-intro-pages`;

  getAll(filter?: ServiceIntroPageFilter): Observable<PagedResult<ServiceIntroPage>> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    params = params.set('pageNumber', String(filter?.pageNumber ?? 1));
    params = params.set('pageSize', String(filter?.pageSize ?? 10));
    if (filter?.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter?.sortDescending !== undefined) {
      params = params.set('sortDescending', String(filter.sortDescending));
    }
    return this.http
      .get<PagedResult<ServiceIntroPage>>(this.apiUrl, { params })
      .pipe(
        map((result) => ({
          ...result,
          items: (result.items ?? []).map(normalizePage)
        }))
      );
  }

  getAvailableServices(): Observable<AvailableLinkedService[]> {
    return this.http.get<AvailableLinkedService[]>(`${this.apiUrl}/available-services`);
  }

  getById(id: number): Observable<ServiceIntroPage> {
    return this.http
      .get<ServiceIntroPage>(`${this.apiUrl}/${id}`)
      .pipe(map(normalizePage));
  }

  create(dto: CreateServiceIntroPageRequest): Observable<ServiceIntroPage> {
    const payload = {
      serviceId: dto.serviceId,
      description: dto.description,
      processingDuration: dto.processingDuration,
      videoUrl: dto.videoUrl || null,
      videoFileName: dto.videoFileName || null,
      documents: serializeDocuments(dto.documents),
      faqIds: serializeFaqIds(dto.faqIds),
      publish: dto.publish
    };
    return this.http
      .post<ServiceIntroPage>(this.apiUrl, payload)
      .pipe(map(normalizePage));
  }

  update(id: number, dto: UpdateServiceIntroPageRequest): Observable<ServiceIntroPage> {
    const payload = {
      description: dto.description,
      processingDuration: dto.processingDuration,
      videoUrl: dto.videoUrl || null,
      videoFileName: dto.videoFileName || null,
      documents: serializeDocuments(dto.documents),
      faqIds: serializeFaqIds(dto.faqIds)
    };
    return this.http
      .put<ServiceIntroPage>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(normalizePage));
  }

  publish(id: number): Observable<ServiceIntroPage> {
    return this.http
      .post<ServiceIntroPage>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(map(normalizePage));
  }

  unpublish(id: number): Observable<ServiceIntroPage> {
    return this.http
      .post<ServiceIntroPage>(`${this.apiUrl}/${id}/unpublish`, {})
      .pipe(map(normalizePage));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

function normalizePage(page: ServiceIntroPage): ServiceIntroPage {
  return {
    ...page,
    videoUrl: page.videoUrl ?? '',
    videoFileName: page.videoFileName ?? '',
    documents: page.documents ?? [],
    faqs: (page.faqs ?? []) as ServiceFaq[],
    status: page.status as PageStatus
  };
}

function serializeDocuments(documents: ServiceDocument[]) {
  return (documents ?? [])
    .filter((d) => !!d.name?.trim())
    .map((d) => ({
      id: toEntityId(d.id),
      name: d.name.trim(),
      fileUrl: d.fileUrl || null,
      fileName: d.fileName || null,
      fileType: d.fileType || null
    }));
}

function serializeFaqIds(faqIds: number[]): number[] {
  return [...new Set((faqIds ?? []).filter((id) => Number.isFinite(id) && id > 0))].slice(0, 10);
}

function toEntityId(id: number | string | undefined): number {
  if (typeof id === 'number' && id > 0) {
    return id;
  }
  if (typeof id === 'string') {
    const parsed = Number(id);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 0;
}
