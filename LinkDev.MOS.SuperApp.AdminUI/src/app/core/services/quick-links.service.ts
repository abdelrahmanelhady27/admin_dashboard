import { Injectable } from '@angular/core';
import { QuickLink } from '../models/quick-link.model';
import { STORAGE_KEYS } from '../constants/storage-keys';

@Injectable({ providedIn: 'root' })
export class QuickLinksService {
  private links: QuickLink[] = [];

  constructor() {
    this.load();
  }

  getAll(): QuickLink[] {
    return [...this.links].sort((a, b) => a.order - b.order);
  }

  getCount(): number {
    return this.links.length;
  }

  saveAll(links: QuickLink[]): QuickLink[] {
    this.links = links.map((link, index) => ({ ...link, order: index + 1 }));
    this.persist();
    return this.getAll();
  }

  private load(): void {
    const raw = localStorage.getItem(STORAGE_KEYS.QUICK_LINKS);
    this.links = raw ? JSON.parse(raw) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEYS.QUICK_LINKS, JSON.stringify(this.links));
  }

  static seedData(): QuickLink[] {
    return [
      { id: 'ql-1', serviceId: 'svc-a1', systemId: 'sys-a', serviceNameAr: 'خدمة أ1', serviceNameEn: 'Service A1', deepLink: 'app://system-a/service-a1', order: 1 },
      { id: 'ql-2', serviceId: 'svc-a2', systemId: 'sys-a', serviceNameAr: 'خدمة أ2', serviceNameEn: 'Service A2', deepLink: 'app://system-a/service-a2', order: 2 },
      { id: 'ql-3', serviceId: 'svc-b3', systemId: 'sys-b', serviceNameAr: 'خدمة ب3', serviceNameEn: 'Service B3', deepLink: 'app://system-b/service-b3', order: 3 },
      { id: 'ql-4', serviceId: 'svc-c1', systemId: 'sys-c', serviceNameAr: 'خدمة ج1', serviceNameEn: 'Service C1', deepLink: 'app://system-c/service-c1', order: 4 }
    ];
  }
}
