import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceIntroPagesService } from '../../../core/services/service-intro-pages.service';
import { FilesService } from '../../../core/services/files.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  AvailableLinkedService,
  MAX_DESCRIPTION_LENGTH,
  MAX_PROCESSING_DURATION_LENGTH
} from '../../../core/models/service-page.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { FaqEditorComponent } from '../../../shared/components/faq-editor/faq-editor.component';
import { DocumentsEditorComponent } from '../../../shared/components/documents-editor/documents-editor.component';
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
  selector: 'app-service-page-create',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploaderComponent,
    FaqEditorComponent, DocumentsEditorComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="servicePages.createTitle" subtitle="servicePages.createSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem">
      <div class="form-section">
        <h3 class="form-section__title">{{ 'servicePages.basicInfo' | translate }}</h3>
        <p class="form-section__desc">{{ 'servicePages.basicInfoDesc' | translate }}</p>
        <div class="form-group">
          <label class="form-label">{{ 'servicePages.selectSystem' | translate }} <span class="required">*</span></label>
          <select class="form-select" formControlName="systemId" (change)="onSystemChange()">
            <option value="">{{ 'servicePages.selectSystemPlaceholder' | translate }}</option>
            @for (sys of systems; track sys.id) {
              <option [value]="sys.id">{{ getSystemName(sys) }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'servicePages.selectService' | translate }} <span class="required">*</span></label>
          <select class="form-select" formControlName="serviceId">
            <option value="">{{ 'servicePages.selectServicePlaceholder' | translate }}</option>
            @for (svc of filteredServices; track svc.id) {
              <option [value]="svc.id">{{ getServiceName(svc) }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'servicePages.description' | translate }}</label>
          <textarea class="form-textarea" formControlName="description" rows="3" [maxlength]="maxDesc"></textarea>
          <div class="form-counter">{{ form.get('description')?.value?.length || 0 }}/{{ maxDesc }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'servicePages.processingDuration' | translate }}</label>
          <input class="form-input" formControlName="processingDuration" [maxlength]="maxDuration" />
          <div class="form-counter">{{ form.get('processingDuration')?.value?.length || 0 }}/{{ maxDuration }}</div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section__title">{{ 'servicePages.video' | translate }}</h3>
        <p class="form-section__desc">{{ 'servicePages.videoDesc' | translate }}</p>
        <div class="form-group">
          <label class="form-label">{{ 'servicePages.videoUrl' | translate }}</label>
          <input class="form-input" formControlName="videoUrl" [placeholder]="'servicePages.videoUrlPlaceholder' | translate" />
        </div>
        <app-file-uploader
          [label]="'servicePages.uploadVideo'"
          accept=".mp4,video/mp4"
          [allowedTypes]="['mp4', 'video/mp4']"
          [maxSizeMb]="100"
          (fileSelected)="onVideoSelected($event)" />
      </div>

      <div class="form-section">
        <h3 class="form-section__title">{{ 'servicePages.documents' | translate }}</h3>
        <app-documents-editor (formReady)="onDocsReady($event)" />
      </div>

      <div class="form-section">
        <h3 class="form-section__title">{{ 'servicePages.faqs' | translate }}</h3>
        <app-faq-editor (formReady)="onFaqsReady($event)" />
      </div>

      <div class="form-action-bar">
        <a routerLink="/service-pages" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
        @if (canPublish) {
          <button type="button" class="btn btn-primary" [disabled]="saving || uploading" (click)="publish()">{{ 'common.publish' | translate }}</button>
        }
      </div>
    </form>
  `
})
export class ServicePageCreateComponent implements OnInit {
  private readonly servicePages = inject(ServiceIntroPagesService);
  private readonly filesService = inject(FilesService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly maxDesc = MAX_DESCRIPTION_LENGTH;
  readonly maxDuration = MAX_PROCESSING_DURATION_LENGTH;
  readonly canPublish = this.auth.hasPermission(ContentType.ServiceIntroPage, 'publish');

  docsForm: FormGroup | null = null;
  faqsForm: FormGroup | null = null;
  availableServices: AvailableLinkedService[] = [];
  filteredServices: AvailableLinkedService[] = [];
  systems: SystemOption[] = [];
  saving = false;
  uploading = false;

  form = this.fb.group({
    systemId: [''],
    serviceId: [{ value: '', disabled: true }, Validators.required],
    description: ['', Validators.maxLength(MAX_DESCRIPTION_LENGTH)],
    processingDuration: ['', Validators.maxLength(MAX_PROCESSING_DURATION_LENGTH)],
    videoUrl: [''],
    videoFileName: ['']
  });

  ngOnInit(): void {
    this.servicePages.getAvailableServices().subscribe({
      next: (services) => {
        this.availableServices = services.filter((s) => s.isActive);
        this.systems = this.deriveSystems(this.availableServices);
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  getSystemName(sys: SystemOption): string {
    return this.language.currentLang === 'ar' ? sys.nameAr : sys.nameEn;
  }

  getServiceName(svc: AvailableLinkedService): string {
    return this.language.currentLang === 'ar' ? svc.nameAr : svc.nameEn;
  }

  onSystemChange(): void {
    const serviceControl = this.form.get('serviceId');
    serviceControl?.setValue('');
    const systemId = Number(this.form.value.systemId);
    if (!systemId) {
      this.filteredServices = [];
      serviceControl?.disable();
      return;
    }
    this.filteredServices = this.availableServices.filter((s) => s.systemId === systemId);
    serviceControl?.enable();
  }

  onDocsReady(form: FormGroup): void { this.docsForm = form; }
  onFaqsReady(form: FormGroup): void { this.faqsForm = form; }

  onVideoSelected(file: File | null): void {
    if (!file) {
      this.form.patchValue({ videoFileName: '', videoUrl: '' });
      return;
    }
    this.uploading = true;
    this.filesService.upload(file, 'Video').subscribe({
      next: (uploaded) => {
        this.uploading = false;
        this.form.patchValue({
          videoFileName: uploaded.fileName,
          videoUrl: uploaded.url
        });
      },
      error: (err) => {
        this.uploading = false;
        this.form.patchValue({ videoFileName: '', videoUrl: '' });
        this.toast.error(resolveApiErrorKey(err, 'validation.unsupportedFileType'));
      }
    });
  }

  saveDraft(): void {
    if (!this.validateService()) return;
    this.createPage(false);
  }

  publish(): void {
    if (!this.validateService()) return;
    if (!this.validatePublish()) return;
    this.createPage(true);
  }

  private deriveSystems(services: AvailableLinkedService[]): SystemOption[] {
    const byId = new Map<number, SystemOption>();
    for (const svc of services) {
      if (!byId.has(svc.systemId)) {
        byId.set(svc.systemId, {
          id: svc.systemId,
          nameAr: svc.systemNameAr || '',
          nameEn: svc.systemNameEn || ''
        });
      }
    }
    return Array.from(byId.values());
  }

  private validateService(): boolean {
    if (!this.form.get('systemId')?.value) {
      this.toast.error('validation.systemRequired');
      return false;
    }
    const serviceIdValue = this.form.get('serviceId')?.value;
    if (!serviceIdValue) {
      this.toast.error('validation.serviceRequired');
      return false;
    }
    return true;
  }

  private validatePublish(): boolean {
    const { description, processingDuration } = this.form.value;
    if (!description?.trim() || !processingDuration?.trim()) {
      this.toast.error('validation.completeRequiredFields');
      return false;
    }
    const faqs = this.faqsForm?.value.faqs || [];
    for (const faq of faqs) {
      if ((faq.question && !faq.answer) || (!faq.question && faq.answer)) {
        this.toast.error('validation.faqIncomplete');
        return false;
      }
    }
    return true;
  }

  private createPage(publish: boolean): void {
    this.saving = true;
    const raw = this.form.getRawValue();
    this.servicePages.create({
      serviceId: Number(raw.serviceId),
      description: raw.description || '',
      processingDuration: raw.processingDuration || '',
      videoUrl: raw.videoUrl || null,
      videoFileName: raw.videoFileName || null,
      documents: this.docsForm?.value.documents || [],
      faqs: this.faqsForm?.value.faqs || [],
      publish
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success(publish ? 'messages.publishedSuccessfully' : 'messages.savedAsDraft');
        this.router.navigate(['/service-pages']);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
