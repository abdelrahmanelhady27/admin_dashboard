import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AvailableLinkedService,
  FaqItem,
  ServiceDocument,
  ServiceIntroPage
} from '../models/service-page.model';
import { PageStatus } from '../models/enums';
import { environment } from '../../../environments/environment.dev';

export interface ServiceIntroPageFilter {
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
  faqs: FaqItem[];
  publish: boolean;
}

export interface UpdateServiceIntroPageRequest {
  description: string;
  processingDuration: string;
  videoUrl?: string | null;
  videoFileName?: string | null;
  documents: ServiceDocument[];
  faqs: FaqItem[];
}

@Injectable({ providedIn: 'root' })
export class ServiceIntroPagesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/service-intro-pages`;

  getAll(filter?: ServiceIntroPageFilter): Observable<ServiceIntroPage[]> {
    let params = new HttpParams();
    if (filter?.search) {
      params = params.set('search', filter.search);
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    return this.http
      .get<ServiceIntroPage[]>(this.apiUrl, { params })
      .pipe(map((pages) => pages.map(normalizePage)));
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
      faqs: serializeFaqs(dto.faqs),
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
      faqs: serializeFaqs(dto.faqs)
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
    faqs: page.faqs ?? [],
    status: page.status as PageStatus
  };
}

function serializeDocuments(documents: ServiceDocument[]) {
  return (documents ?? [])
    .filter((d) => !!d.name?.trim())
    .map((d) => ({
      name: d.name.trim(),
      fileUrl: d.fileUrl || null,
      fileName: d.fileName || null,
      fileType: d.fileType || null
    }));
}

function serializeFaqs(faqs: FaqItem[]) {
  return (faqs ?? [])
    .filter((f) => !!f.question?.trim() && !!f.answer?.trim())
    .map((f) => ({
      question: f.question.trim(),
      answer: f.answer.trim()
    }));
}
