import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicePagesService } from '../../../core/services/service-pages.service';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_PROCESSING_DURATION_LENGTH
} from '../../../core/models/service-page.model';
import { PageStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { FaqEditorComponent } from '../../../shared/components/faq-editor/faq-editor.component';
import { DocumentsEditorComponent } from '../../../shared/components/documents-editor/documents-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';

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
          <label class="form-label">{{ 'servicePages.selectService' | translate }} <span class="required">*</span></label>
          <select class="form-select" formControlName="serviceId">
            <option value="">{{ 'servicePages.selectServicePlaceholder' | translate }}</option>
            @for (svc of availableServices; track svc.id) {
              <option [value]="svc.id">{{ getServiceLabel(svc) }}</option>
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
        <button type="button" class="btn btn-outline" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="publish()">{{ 'common.publish' | translate }}</button>
      </div>
    </form>
  `
})
export class ServicePageCreateComponent {
  private readonly servicePages = inject(ServicePagesService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly maxDesc = MAX_DESCRIPTION_LENGTH;
  readonly maxDuration = MAX_PROCESSING_DURATION_LENGTH;

  docsForm: FormGroup | null = null;
  faqsForm: FormGroup | null = null;

  form = this.fb.group({
    serviceId: ['', Validators.required],
    description: ['', Validators.maxLength(MAX_DESCRIPTION_LENGTH)],
    processingDuration: ['', Validators.maxLength(MAX_PROCESSING_DURATION_LENGTH)],
    videoUrl: [''],
    videoFileName: ['']
  });

  get availableServices() {
    return this.servicePages.getServices().filter((s) => !this.servicePages.getByServiceId(s.id));
  }

  getServiceLabel(svc: { nameAr: string; nameEn: string }): string {
    return this.language.currentLang === 'ar' ? svc.nameAr : svc.nameEn;
  }

  onDocsReady(form: FormGroup): void { this.docsForm = form; }
  onFaqsReady(form: FormGroup): void { this.faqsForm = form; }

  onVideoSelected(file: File | null): void {
    if (file) {
      this.form.patchValue({ videoFileName: file.name, videoUrl: '' });
    }
  }

  saveDraft(): void {
    if (!this.validateService()) return;
    this.createPage(PageStatus.Draft);
    this.toast.success('messages.savedAsDraft');
    this.router.navigate(['/service-pages']);
  }

  publish(): void {
    if (!this.validateService()) return;
    if (!this.validatePublish()) return;
    const page = this.createPage(PageStatus.Draft);
    this.servicePages.publish(page.id);
    this.toast.success('messages.publishedSuccessfully');
    this.router.navigate(['/service-pages']);
  }

  private validateService(): boolean {
    if (!this.form.get('serviceId')?.value) {
      this.toast.error('validation.serviceRequired');
      return false;
    }
    const serviceId = this.form.get('serviceId')?.value;
    if (serviceId && this.servicePages.getByServiceId(serviceId)) {
      this.toast.error('validation.duplicateServicePage');
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

  private createPage(status: PageStatus) {
    const service = this.servicePages.getServiceById(this.form.value.serviceId!)!;
    return this.servicePages.create({
      serviceId: service.id,
      serviceNameAr: service.nameAr,
      serviceNameEn: service.nameEn,
      status,
      description: this.form.value.description || '',
      processingDuration: this.form.value.processingDuration || '',
      videoUrl: this.form.value.videoUrl || '',
      videoFileName: this.form.value.videoFileName || '',
      documents: this.docsForm?.value.documents || [],
      faqs: (this.faqsForm?.value.faqs || []).filter((f: { question: string; answer: string }) => f.question && f.answer)
    });
  }
}
