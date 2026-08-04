import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QuickLink } from '../models/quick-link.model';
import { AvailableLinkedService } from '../models/service-page.model';
import { environment } from '../../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class QuickLinksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/quick-links`;

  getAll(): Observable<QuickLink[]> {
    return this.http.get<QuickLink[]>(this.apiUrl);
  }

  getAvailableServices(): Observable<AvailableLinkedService[]> {
    return this.http.get<AvailableLinkedService[]>(`${this.apiUrl}/available-services`);
  }

  save(serviceIdsInOrder: number[]): Observable<QuickLink[]> {
    return this.http.put<QuickLink[]>(this.apiUrl, {
      links: serviceIdsInOrder.map((serviceId) => ({ serviceId }))
    });
  }
}
