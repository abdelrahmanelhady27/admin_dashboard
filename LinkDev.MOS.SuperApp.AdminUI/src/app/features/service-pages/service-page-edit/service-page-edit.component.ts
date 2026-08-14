import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ServiceIntroPagesService } from '../../../core/services/service-intro-pages.service';
import { FilesService } from '../../../core/services/files.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  ServiceIntroPage,
  MAX_DESCRIPTION_LENGTH,
  MAX_DOCUMENT_NAME_LENGTH,
  MAX_PROCESSING_DURATION_LENGTH
} from '../../../core/models/service-page.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { FaqPickerComponent } from '../../../shared/components/faq-picker/faq-picker.component';
import { DocumentsEditorComponent } from '../../../shared/components/documents-editor/documents-editor.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-page-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageHeaderComponent, FileUploaderComponent,
    FaqPickerComponent, DocumentsEditorComponent, ConfirmDialogComponent, TranslatePipe
  ],
  template: `
    @if (page) {
      <app-page-header title="servicePages.editTitle" />

      <form [formGroup]="form" class="card">
        <div class="form-row readonly">
          <label>{{ 'servicePages.serviceName' | translate }}</label>
          <input [value]="getServiceName(page)" readonly />
        </div>

        <div class="form-row">
          <label>{{ 'servicePages.description' | translate }}</label>
          <textarea formControlName="description" rows="3" [maxlength]="maxDesc"></textarea>
        </div>

        <div class="form-row">
          <label>{{ 'servicePages.processingDuration' | translate }}</label>
          <input formControlName="processingDuration" [maxlength]="maxDuration" />
        </div>

        <div class="form-row">
          <label>{{ 'servicePages.videoUrl' | translate }}</label>
          <input formControlName="videoUrl" />
          <app-file-uploader
            accept=".mp4,video/mp4"
            [allowedTypes]="['mp4']"
            [maxSizeMb]="100"
            (fileSelected)="onVideoSelected($event)" />
        </div>

        <h3>{{ 'servicePages.documents' | translate }}</h3>
        <app-documents-editor #docsEditor (formReady)="onDocsReady($event)" />

        <h3>{{ 'servicePages.faqs' | translate }}</h3>
        <app-faq-picker #faqPicker (formReady)="onFaqsReady($event)" />

        <div class="form-actions">
          <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
          @if (canPublish) {
            <button type="button" class="btn btn-primary" [disabled]="saving || uploading" (click)="publish()">{{ 'common.publish' | translate }}</button>
          }
          <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="showCancelConfirm = true">{{ 'common.cancel' | translate }}</button>
        </div>
      </form>

      <app-confirm-dialog
        [visible]="showCancelConfirm"
        title="common.confirm"
        message="servicePages.confirmCancel"
        (confirmed)="confirmCancel()"
        (cancelled)="showCancelConfirm = false" />
    }
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .form-row { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; color: var(--text-muted); }
    input, textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
    .readonly input { background: var(--page-bg); }
    h3 { margin: 1.5rem 0 0.75rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; flex-wrap: wrap; }
  `]
})
export class ServicePageEditComponent implements OnInit {
  @ViewChild('docsEditor') docsEditor?: DocumentsEditorComponent;
  @ViewChild('faqPicker') faqPicker?: FaqPickerComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicePages = inject(ServiceIntroPagesService);
  private readonly filesService = inject(FilesService);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  page: ServiceIntroPage | null = null;
  docsForm: FormGroup | null = null;
  faqsForm: FormGroup | null = null;
  saving = false;
  uploading = false;
  showCancelConfirm = false;
  private initialEditorsBound = false;
  private readonly returnTo = this.route.snapshot.queryParamMap.get('returnTo') ?? 'details';
  readonly maxDesc = MAX_DESCRIPTION_LENGTH;
  readonly maxDuration = MAX_PROCESSING_DURATION_LENGTH;
  readonly canPublish = this.auth.hasPermission(ContentType.ServiceIntroPage, 'publish');

  form = this.fb.group({
    description: ['', Validators.maxLength(MAX_DESCRIPTION_LENGTH)],
    processingDuration: ['', Validators.maxLength(MAX_PROCESSING_DURATION_LENGTH)],
    videoUrl: [''],
    videoFileName: ['']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.servicePages.getById(id).subscribe({
      next: (page) => {
        this.page = page;
        this.form.patchValue({
          description: page.description,
          processingDuration: page.processingDuration,
          videoUrl: page.videoUrl,
          videoFileName: page.videoFileName
        });
        this.tryBindEditors();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  getServiceName(page: ServiceIntroPage): string {
    return this.language.currentLang === 'ar' ? page.serviceNameAr : page.serviceNameEn;
  }

  onDocsReady(form: FormGroup): void {
    this.docsForm = form;
    this.tryBindEditors();
  }

  onFaqsReady(form: FormGroup): void {
    this.faqsForm = form;
    this.tryBindEditors();
  }

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
        this.toast.error(resolveApiErrorKey(err, 'validation.unsupportedFileType'));
      }
    });
  }

  saveDraft(): void {
    if (!this.page) return;
    this.saving = true;
    this.servicePages.update(this.page.id, this.buildPayload()).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedAsDraft');
        this.navigateBack();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  publish(): void {
    if (!this.page) return;
    const { description, processingDuration } = this.form.value;
    if (!description?.trim() || !processingDuration?.trim()) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    this.saving = true;
    this.servicePages.update(this.page.id, this.buildPayload()).pipe(
      switchMap((updated) => this.servicePages.publish(updated.id))
    ).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.publishedSuccessfully');
        this.navigateBack();
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  confirmCancel(): void {
    this.showCancelConfirm = false;
    this.navigateBack();
  }

  private navigateBack(): void {
    if (!this.page) return;
    if (this.returnTo === 'list') {
      this.router.navigate(['/service-pages']);
      return;
    }
    this.router.navigate(['/service-pages', this.page.id]);
  }

  private buildPayload() {
    return {
      description: this.form.value.description || '',
      processingDuration: this.form.value.processingDuration || '',
      videoUrl: this.form.value.videoUrl || null,
      videoFileName: this.form.value.videoFileName || null,
      documents: this.docsForm?.value.documents || [],
      faqIds: this.faqsForm?.value.faqIds || []
    };
  }

  private tryBindEditors(): void {
    if (!this.page || this.initialEditorsBound || !this.docsForm || !this.faqsForm) {
      return;
    }

    // Defer so @if (page) has created the editors and ViewChild is available
    setTimeout(() => {
      if (!this.page || this.initialEditorsBound || !this.docsForm || !this.faqsForm) {
        return;
      }

      if (this.docsEditor) {
        this.docsEditor.setDocuments(this.page.documents || []);
      } else {
        this.bindDocumentsToForm(this.page.documents || []);
      }

      if (this.faqPicker) {
        this.faqPicker.setFaqIds((this.page.faqs || []).map((f) => f.id));
      } else {
        this.faqsForm.patchValue({ faqIds: (this.page.faqs || []).map((f) => f.id) });
      }
      this.initialEditorsBound = true;
    });
  }

  private bindDocumentsToForm(
    items: { id: number | string; name: string; fileName: string; fileType: string; fileUrl?: string }[]
  ): void {
    const documents = this.docsForm!.get('documents') as FormArray;
    documents.clear();
    for (const item of items) {
      documents.push(this.fb.group({
        id: [item.id],
        name: [item.name, [Validators.required, Validators.maxLength(MAX_DOCUMENT_NAME_LENGTH)]],
        fileName: [item.fileName],
        fileType: [item.fileType],
        fileUrl: [item.fileUrl || '']
      }));
    }
  }
}
