import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { QuickLinksService } from '../../../core/services/quick-links.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuickLink } from '../../../core/models/quick-link.model';
import { AvailableLinkedService } from '../../../core/models/service-page.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { QuickLinkSortableListComponent } from '../../../shared/components/quick-link-sortable-list/quick-link-sortable-list.component';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

interface SystemOption {
  id: number;
  nameAr: string;
  nameEn: string;
}

@Component({
  selector: 'app-quick-links-manage',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageHeaderComponent,
    QuickLinkSortableListComponent, SkeletonComponent, ConfirmDialogComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="nav.quickLinks" subtitle="quickLinks.listSubtitle" />

    <div class="alert alert-info">{{ 'quickLinks.infoAlert' | translate }}</div>

    <div class="u-card" style="padding:1.5rem">
      @if (isEditing && canAddOrEdit) {
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
      }

      <div class="section-header">
        <h3 class="form-section__title" style="margin:0">{{ 'quickLinks.currentLinks' | translate }}</h3>
        @if (!loading && !isEditing && canManage) {
          <button type="button" class="btn btn-primary" (click)="startEditing()">{{ 'common.edit' | translate }}</button>
        }
      </div>

      @if (loading) {
        @for (i of [1,2,3]; track i) {
          <app-skeleton height="56px" [radius]="'var(--radius-md)'" />
          <div style="height:0.5rem"></div>
        }
      } @else {
        <app-quick-link-sortable-list
          [links]="links"
          [readonly]="!isEditing"
          [canReorder]="canAddOrEdit"
          [canDelete]="canDelete"
          (linksChange)="links = $event"
          (linkDeleted)="deleteLink($event)" />
      }

      @if (isEditing) {
        <div class="form-action-bar" style="margin:1.5rem -1.5rem -1.5rem">
          <button type="button" class="btn btn-outline" (click)="cancel()">{{ 'common.cancel' | translate }}</button>
          <button type="button" class="btn btn-primary" (click)="requestSave()">{{ 'common.save' | translate }}</button>
        </div>
      }
    </div>

    <app-confirm-dialog
      [visible]="showSaveConfirm"
      title="common.confirm"
      message="quickLinks.confirmSave"
      (confirmed)="saveConfirmed()"
      (cancelled)="showSaveConfirm = false" />
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
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .add-form { max-width: 480px; }
    @media (max-width: 767px) {
      .add-form { max-width: none; }
      .section-header {
        flex-wrap: wrap;
      }
    }
  `]
})
export class QuickLinksManageComponent implements OnInit {
  private readonly quickLinksService = inject(QuickLinksService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly canAddOrEdit =
    this.auth.hasPermission(ContentType.QuickLinks, 'create') ||
    this.auth.hasPermission(ContentType.QuickLinks, 'edit');
  readonly canDelete = this.auth.hasPermission(ContentType.QuickLinks, 'delete');
  readonly canManage = this.canAddOrEdit || this.canDelete;

  loading = true;
  saving = false;
  isEditing = false;
  showSaveConfirm = false;
  links: QuickLink[] = [];
  originalLinks: QuickLink[] = [];
  availableServices: AvailableLinkedService[] = [];
  originalAvailableServices: AvailableLinkedService[] = [];
  filteredServices: AvailableLinkedService[] = [];
  selectedDeepLink = '';

  addForm = this.fb.group({ systemId: [''], serviceId: [''] });

  get systems(): SystemOption[] {
    const map = new Map<number, SystemOption>();
    for (const svc of this.availableServices) {
      if (!map.has(svc.systemId)) {
        map.set(svc.systemId, {
          id: svc.systemId,
          nameAr: svc.systemNameAr ?? '',
          nameEn: svc.systemNameEn ?? ''
        });
      }
    }
    return [...map.values()].sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }

  ngOnInit(): void {
    this.load();
  }

  startEditing(): void {
    if (!this.canManage) {
      return;
    }
    this.isEditing = true;
  }

  getSystemName(sys: { nameAr: string; nameEn: string }): string {
    return this.language.currentLang === 'ar' ? sys.nameAr : sys.nameEn;
  }

  getServiceName(svc: AvailableLinkedService): string {
    return this.language.currentLang === 'ar' ? svc.nameAr : svc.nameEn;
  }

  onSystemChange(): void {
    const systemId = Number(this.addForm.value.systemId);
    this.addForm.patchValue({ serviceId: '' });
    this.selectedDeepLink = '';
    if (!systemId) {
      this.filteredServices = [];
      return;
    }
    this.filteredServices = this.availableServices.filter((s) => s.systemId === systemId);
    if (!this.filteredServices.length) {
      this.toast.warning('validation.noServicesForSystem');
    }
  }

  onServiceChange(): void {
    const serviceId = Number(this.addForm.value.serviceId);
    const svc = this.availableServices.find((s) => s.id === serviceId);
    this.selectedDeepLink = svc?.deepLink || '';
  }

  addLink(): void {
    if (!this.canAddOrEdit) {
      this.toast.error('validation.noAddEditPermissionQuickLinks');
      return;
    }
    const systemId = Number(this.addForm.value.systemId);
    const serviceId = Number(this.addForm.value.serviceId);
    if (!systemId) {
      this.toast.error('validation.systemRequired');
      return;
    }
    if (!serviceId) {
      this.toast.error('validation.serviceRequired');
      return;
    }
    const svc = this.availableServices.find((s) => s.id === serviceId);
    if (!svc) {
      this.toast.error('validation.serviceRequired');
      return;
    }
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

    this.links = [
      ...this.links,
      {
        id: 0,
        serviceId: svc.id,
        systemId: svc.systemId,
        serviceNameAr: svc.nameAr,
        serviceNameEn: svc.nameEn,
        systemNameAr: svc.systemNameAr ?? '',
        systemNameEn: svc.systemNameEn ?? '',
        deepLink: svc.deepLink,
        displayOrder: this.links.length + 1
      }
    ];

    this.availableServices = this.availableServices.filter((s) => s.id !== serviceId);
    this.addForm.patchValue({ serviceId: '' });
    this.selectedDeepLink = '';
    this.refreshFilteredServices();
    this.toast.success('messages.quickLinkAdded');
  }

  deleteLink(serviceId: number): void {
    if (!this.canDelete) {
      this.toast.error('validation.noDeletePermissionQuickLinks');
      return;
    }
    const removed = this.links.find((l) => l.serviceId === serviceId);
    this.links = this.links
      .filter((l) => l.serviceId !== serviceId)
      .map((l, i) => ({ ...l, displayOrder: i + 1 }));

    if (removed && !this.availableServices.some((s) => s.id === removed.serviceId)) {
      this.availableServices = [
        ...this.availableServices,
        {
          id: removed.serviceId,
          systemId: removed.systemId,
          nameAr: removed.serviceNameAr,
          nameEn: removed.serviceNameEn,
          deepLink: removed.deepLink,
          isActive: true,
          systemNameAr: removed.systemNameAr,
          systemNameEn: removed.systemNameEn
        }
      ];
    }

    this.refreshFilteredServices();
    this.toast.success('messages.quickLinkDeleted');
  }

  requestSave(): void {
    this.showSaveConfirm = true;
  }

  saveConfirmed(): void {
    this.showSaveConfirm = false;
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.quickLinksService.save(this.links.map((l) => l.serviceId)).subscribe({
      next: (saved) => {
        this.links = saved;
        this.originalLinks = [...saved];
        this.saving = false;
        this.isEditing = false;
        this.resetAddForm();
        this.toast.success('messages.quickLinksSaved');
        this.reloadAvailableServices();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  cancel(): void {
    this.links = this.originalLinks.map((l) => ({ ...l }));
    this.availableServices = this.originalAvailableServices.map((s) => ({ ...s }));
    this.resetAddForm();
    this.isEditing = false;
    this.toast.success('messages.operationCancelled');
  }

  private resetAddForm(): void {
    this.addForm.reset({ systemId: '', serviceId: '' });
    this.selectedDeepLink = '';
    this.filteredServices = [];
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      links: this.quickLinksService.getAll(),
      available: this.quickLinksService.getAvailableServices()
    }).subscribe({
      next: ({ links, available }) => {
        this.links = links;
        this.originalLinks = links.map((l) => ({ ...l }));
        this.availableServices = available;
        this.originalAvailableServices = available.map((s) => ({ ...s }));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  private reloadAvailableServices(): void {
    this.quickLinksService.getAvailableServices().subscribe({
      next: (available) => {
        this.availableServices = available;
        this.originalAvailableServices = available.map((s) => ({ ...s }));
        this.refreshFilteredServices();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  private refreshFilteredServices(): void {
    const systemId = Number(this.addForm.value.systemId);
    this.filteredServices = systemId
      ? this.availableServices.filter((s) => s.systemId === systemId)
      : [];
  }
}
