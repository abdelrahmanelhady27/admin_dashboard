import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { QuickLinksService } from '../../../core/services/quick-links.service';
import { ServicePagesService } from '../../../core/services/service-pages.service';
import { QuickLink } from '../../../core/models/quick-link.model';
import { LinkedService } from '../../../core/models/service-page.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { QuickLinkSortableListComponent } from '../../../shared/components/quick-link-sortable-list/quick-link-sortable-list.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-quick-links-manage',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageHeaderComponent,
    QuickLinkSortableListComponent, SkeletonComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.quickLinks" subtitle="quickLinks.listSubtitle" />

    <div class="alert alert-info">{{ 'quickLinks.infoAlert' | translate }}</div>

    <div class="u-card" style="padding:1.5rem">
      <div class="form-section" style="margin-bottom:0;box-shadow:none;border:none;padding:0 0 1.5rem">
        <h3 class="form-section__title">{{ 'quickLinks.addLink' | translate }}</h3>
        <p class="form-section__desc">{{ 'quickLinks.addHint' | translate }}</p>
        <form [formGroup]="addForm" class="add-form">
          <div class="form-group">
            <label class="form-label">{{ 'quickLinks.selectSystem' | translate }}</label>
            <select class="form-select" formControlName="systemId" (change)="onSystemChange()">
              <option value="">{{ 'quickLinks.selectSystemPlaceholder' | translate }}</option>
              @for (sys of systems; track sys.id) {
                <option [value]="sys.id">{{ getSystemName(sys) }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'quickLinks.selectService' | translate }}</label>
            <select class="form-select" formControlName="serviceId" (change)="onServiceChange()">
              <option value="">{{ 'quickLinks.selectServicePlaceholder' | translate }}</option>
              @for (svc of filteredServices; track svc.id) {
                <option [value]="svc.id">{{ getServiceName(svc) }}</option>
              }
            </select>
          </div>
          @if (selectedDeepLink) {
            <div class="form-group">
              <label class="form-label">{{ 'quickLinks.deepLink' | translate }}</label>
              <input class="form-input" [value]="selectedDeepLink" readonly />
            </div>
          }
          <button type="button" class="btn btn-primary" (click)="addLink()">+ {{ 'quickLinks.addLink' | translate }}</button>
        </form>
      </div>

      <h3 class="form-section__title">{{ 'quickLinks.currentLinks' | translate }}</h3>
      @if (loading) {
        @for (i of [1,2,3]; track i) {
          <app-skeleton height="56px" [radius]="'var(--radius-md)'" />
          <div style="height:0.5rem"></div>
        }
      } @else {
        <app-quick-link-sortable-list
          [links]="links"
          (linksChange)="links = $event"
          (linkDeleted)="deleteLink($event)" />
      }

      <div class="form-action-bar" style="margin:1.5rem -1.5rem -1.5rem">
        <button type="button" class="btn btn-outline" (click)="cancel()">{{ 'common.cancel' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="save()">{{ 'common.save' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .alert-info {
      background: linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%);
      color: var(--info-color);
      padding: 0.875rem 1.125rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.25rem;
      font-size: 0.875rem;
      border: 1px solid #BFDBFE;
    }
    .add-form { max-width: 480px; }
    @media (max-width: 767px) {
      .add-form { max-width: none; }
    }
  `]
})
export class QuickLinksManageComponent implements OnInit {
  private readonly quickLinksService = inject(QuickLinksService);
  private readonly servicePages = inject(ServicePagesService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  loading = true;
  links: QuickLink[] = [];
  filteredServices: LinkedService[] = [];
  selectedDeepLink = '';
  originalLinks: QuickLink[] = [];

  addForm = this.fb.group({ systemId: [''], serviceId: [''] });

  get systems() { return this.servicePages.getSystems(); }

  ngOnInit(): void {
    setTimeout(() => {
      this.links = this.quickLinksService.getAll();
      this.originalLinks = [...this.links];
      this.loading = false;
    }, 350);
  }

  getSystemName(sys: { nameAr: string; nameEn: string }): string {
    return this.language.currentLang === 'ar' ? sys.nameAr : sys.nameEn;
  }

  getServiceName(svc: LinkedService): string {
    return this.language.currentLang === 'ar' ? svc.nameAr : svc.nameEn;
  }

  onSystemChange(): void {
    const systemId = this.addForm.value.systemId;
    this.addForm.patchValue({ serviceId: '' });
    this.selectedDeepLink = '';
    if (!systemId) {
      this.filteredServices = [];
      return;
    }
    this.filteredServices = this.servicePages.getServicesBySystem(systemId).filter((s) => s.isActive);
    if (!this.filteredServices.length) {
      this.toast.warning('validation.noServicesForSystem');
    }
  }

  onServiceChange(): void {
    const svc = this.servicePages.getServiceById(this.addForm.value.serviceId || '');
    this.selectedDeepLink = svc?.deepLink || '';
  }

  addLink(): void {
    const { systemId, serviceId } = this.addForm.value;
    if (!systemId) {
      this.toast.error('validation.systemRequired');
      return;
    }
    if (!serviceId) {
      this.toast.error('validation.serviceRequired');
      return;
    }
    const svc = this.servicePages.getServiceById(serviceId)!;
    if (!svc.isActive) {
      this.toast.error('validation.serviceMustBeActive');
      return;
    }
    if (!svc.deepLink) {
      this.toast.error('validation.invalidDeepLink');
      return;
    }
    if (this.links.some((l) => l.serviceId === serviceId)) {
      this.toast.error('validation.duplicateQuickLink');
      return;
    }
    this.links = [...this.links, {
      id: `ql-${Date.now()}`,
      serviceId: svc.id,
      systemId: svc.systemId,
      serviceNameAr: svc.nameAr,
      serviceNameEn: svc.nameEn,
      deepLink: svc.deepLink,
      order: this.links.length + 1
    }];
    this.addForm.patchValue({ serviceId: '' });
    this.selectedDeepLink = '';
    this.toast.success('messages.quickLinkAdded');
  }

  deleteLink(id: string): void {
    this.links = this.links.filter((l) => l.id !== id);
    this.toast.success('messages.quickLinkDeleted');
  }

  save(): void {
    if (!this.links.length) {
      this.toast.warning('validation.noQuickLinks');
      return;
    }
    this.quickLinksService.saveAll(this.links);
    this.originalLinks = [...this.links];
    this.toast.success('messages.quickLinksSaved');
  }

  cancel(): void {
    this.links = [...this.originalLinks];
  }
}
