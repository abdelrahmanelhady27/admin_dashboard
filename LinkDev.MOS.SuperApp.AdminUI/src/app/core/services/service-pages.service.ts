import { Injectable } from '@angular/core';
import {
  LinkedService,
  LinkedSystem,
  ServiceIntroPage
} from '../models/service-page.model';
import { AuditAction, PageStatus } from '../models/enums';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuditLogService } from './audit-log.service';
import { MockAuthService } from './mock-auth.service';

export interface ServicePageFilter {
  search?: string;
  status?: PageStatus | '';
}

@Injectable({ providedIn: 'root' })
export class ServicePagesService {
  private pages: ServiceIntroPage[] = [];
  private systems: LinkedSystem[] = [];
  private services: LinkedService[] = [];

  constructor(
    private readonly auditLog: AuditLogService,
    private readonly auth: MockAuthService
  ) {
    this.load();
  }

  getAll(filter?: ServicePageFilter): ServiceIntroPage[] {
    let result = [...this.pages];
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.serviceNameAr.toLowerCase().includes(term) ||
          p.serviceNameEn.toLowerCase().includes(term)
      );
    }
    if (filter?.status) {
      result = result.filter((p) => p.status === filter.status);
    }
    return result.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
  }

  getById(id: string): ServiceIntroPage | undefined {
    return this.pages.find((p) => p.id === id);
  }

  getByServiceId(serviceId: string): ServiceIntroPage | undefined {
    return this.pages.find((p) => p.serviceId === serviceId);
  }

  getSystems(): LinkedSystem[] {
    return [...this.systems];
  }

  getServices(): LinkedService[] {
    return [...this.services];
  }

  getServicesBySystem(systemId: string): LinkedService[] {
    return this.services.filter((s) => s.systemId === systemId);
  }

  getServiceById(id: string): LinkedService | undefined {
    return this.services.find((s) => s.id === id);
  }

  getCounts(): { total: number; published: number; draft: number } {
    return {
      total: this.pages.length,
      published: this.pages.filter((p) => p.status === PageStatus.Published).length,
      draft: this.pages.filter((p) => p.status === PageStatus.Draft).length
    };
  }

  create(page: Omit<ServiceIntroPage, 'id' | 'createdAt' | 'modifiedAt' | 'modifiedBy'>): ServiceIntroPage {
    const now = new Date().toISOString();
    const created: ServiceIntroPage = {
      ...page,
      id: `sp-${Date.now()}`,
      createdAt: now,
      modifiedAt: now,
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System'
    };
    this.pages.push(created);
    this.persist();
    this.auditLog.log(AuditAction.CreateServicePage, 'ServicePage', created.serviceNameEn);
    return created;
  }

  update(id: string, data: Partial<ServiceIntroPage>): ServiceIntroPage | null {
    const index = this.pages.findIndex((p) => p.id === id);
    if (index === -1) {
      return null;
    }
    this.pages[index] = {
      ...this.pages[index],
      ...data,
      modifiedAt: new Date().toISOString(),
      modifiedBy: this.auth.currentUser?.fullNameEn || 'System'
    };
    this.persist();
    this.auditLog.log(AuditAction.EditServicePage, 'ServicePage', this.pages[index].serviceNameEn);
    return this.pages[index];
  }

  publish(id: string): ServiceIntroPage | null {
    const page = this.getById(id);
    if (!page) {
      return null;
    }
    page.status = PageStatus.Published;
    page.publishedSnapshot = { ...page };
    page.modifiedAt = new Date().toISOString();
    page.modifiedBy = this.auth.currentUser?.fullNameEn || 'System';
    this.persist();
    this.auditLog.log(AuditAction.PublishServicePage, 'ServicePage', page.serviceNameEn);
    return page;
  }

  unpublish(id: string): ServiceIntroPage | null {
    const page = this.getById(id);
    if (!page) {
      return null;
    }
    page.status = PageStatus.Unpublished;
    page.modifiedAt = new Date().toISOString();
    page.modifiedBy = this.auth.currentUser?.fullNameEn || 'System';
    this.persist();
    this.auditLog.log(AuditAction.UnpublishServicePage, 'ServicePage', page.serviceNameEn);
    return page;
  }

  saveAsDraft(id: string, data: Partial<ServiceIntroPage>): ServiceIntroPage | null {
    return this.update(id, { ...data, status: PageStatus.Draft });
  }

  private load(): void {
    const pagesRaw = localStorage.getItem(STORAGE_KEYS.SERVICE_PAGES);
    const systemsRaw = localStorage.getItem(STORAGE_KEYS.SYSTEMS);
    const servicesRaw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    this.pages = pagesRaw ? JSON.parse(pagesRaw) : [];
    this.systems = systemsRaw ? JSON.parse(systemsRaw) : [];
    this.services = servicesRaw ? JSON.parse(servicesRaw) : [];
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEYS.SERVICE_PAGES, JSON.stringify(this.pages));
  }

  static seedSystems(): LinkedSystem[] {
    return [
      { id: 'sys-a', nameAr: 'النظام أ', nameEn: 'System A' },
      { id: 'sys-b', nameAr: 'النظام ب', nameEn: 'System B' },
      { id: 'sys-c', nameAr: 'النظام ج', nameEn: 'System C' }
    ];
  }

  static seedServices(): LinkedService[] {
    return [
      { id: 'svc-a1', systemId: 'sys-a', nameAr: 'خدمة أ1', nameEn: 'Service A1', deepLink: 'app://system-a/service-a1', isActive: true },
      { id: 'svc-a2', systemId: 'sys-a', nameAr: 'خدمة أ2', nameEn: 'Service A2', deepLink: 'app://system-a/service-a2', isActive: true },
      { id: 'svc-a3', systemId: 'sys-a', nameAr: 'خدمة أ3', nameEn: 'Service A3', deepLink: '', isActive: false },
      { id: 'svc-b1', systemId: 'sys-b', nameAr: 'خدمة ب1', nameEn: 'Service B1', deepLink: 'app://system-b/service-b1', isActive: true },
      { id: 'svc-b2', systemId: 'sys-b', nameAr: 'خدمة ب2', nameEn: 'Service B2', deepLink: 'app://system-b/service-b2', isActive: false },
      { id: 'svc-b3', systemId: 'sys-b', nameAr: 'خدمة ب3', nameEn: 'Service B3', deepLink: 'app://system-b/service-b3', isActive: true },
      { id: 'svc-c1', systemId: 'sys-c', nameAr: 'خدمة ج1', nameEn: 'Service C1', deepLink: 'app://system-c/service-c1', isActive: true },
      { id: 'svc-c2', systemId: 'sys-c', nameAr: 'خدمة ج2', nameEn: 'Service C2', deepLink: 'app://system-c/service-c2', isActive: true }
    ];
  }

  static seedPages(): ServiceIntroPage[] {
    const now = new Date().toISOString();
    return [
      {
        id: 'sp-1',
        serviceId: 'svc-a1',
        serviceNameAr: 'خدمة أ1',
        serviceNameEn: 'Service A1',
        status: PageStatus.Published,
        description: 'Intro page for Service A1 with processing details.',
        processingDuration: '3 business days',
        videoUrl: '',
        videoFileName: '',
        documents: [],
        faqs: [{ id: 'faq-1', question: 'How to apply?', answer: 'Submit through the portal.' }],
        publishedSnapshot: undefined,
        createdAt: now,
        modifiedAt: now,
        modifiedBy: 'System Administrator'
      },
      {
        id: 'sp-2',
        serviceId: 'svc-b1',
        serviceNameAr: 'خدمة ب1',
        serviceNameEn: 'Service B1',
        status: PageStatus.Draft,
        description: 'Draft intro page.',
        processingDuration: '',
        videoUrl: '',
        videoFileName: '',
        documents: [],
        faqs: [],
        createdAt: now,
        modifiedAt: now,
        modifiedBy: 'System Administrator'
      }
    ];
  }
}
