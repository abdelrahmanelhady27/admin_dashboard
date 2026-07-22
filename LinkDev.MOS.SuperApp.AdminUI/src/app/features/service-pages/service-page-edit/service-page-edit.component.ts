import { Component, ViewChild, inject, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { ServiceIntroPagesService } from '../../../core/services/service-intro-pages.service';
import { ServiceIntroPage, MAX_DESCRIPTION_LENGTH, MAX_PROCESSING_DURATION_LENGTH } from '../../../core/models/service-page.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { FaqEditorComponent } from '../../../shared/components/faq-editor/faq-editor.component';
import { DocumentsEditorComponent } from '../../../shared/components/documents-editor/documents-editor.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageService } from '../../../core/services/language.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-service-page-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploaderComponent,
    FaqEditorComponent, DocumentsEditorComponent, TranslatePipe
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
          <app-file-uploader accept=".mp4,video/mp4" [allowedTypes]="['mp4']" (fileSelected)="onVideoSelected($event)" />
        </div>

        <h3>{{ 'servicePages.documents' | translate }}</h3>
        <app-documents-editor #docsEditor (formReady)="onDocsReady($event)" />

        <h3>{{ 'servicePages.faqs' | translate }}</h3>
        <app-faq-editor #faqEditor (formReady)="onFaqsReady($event)" />

        <div class="form-actions">
          <button type="button" class="btn btn-outline" [disabled]="saving" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
          <button type="button" class="btn btn-primary" [disabled]="saving" (click)="publish()">{{ 'common.publish' | translate }}</button>
          <a [routerLink]="['/service-pages', page.id]" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
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
export class ServicePageEditComponent implements OnInit, AfterViewInit {
  @ViewChild('docsEditor') docsEditor!: DocumentsEditorComponent;
  @ViewChild('faqEditor') faqEditor!: FaqEditorComponent;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly servicePages = inject(ServiceIntroPagesService);
  private readonly language = inject(LanguageService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  page: ServiceIntroPage | null = null;
  docsForm: FormGroup | null = null;
  faqsForm: FormGroup | null = null;
  saving = false;
  private editorsReady = false;
  readonly maxDesc = MAX_DESCRIPTION_LENGTH;
  readonly maxDuration = MAX_PROCESSING_DURATION_LENGTH;

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
        this.populateEditors();
      },
      error: (err) => this.toast.error(err.error?.message || 'common.error')
    });
  }

  ngAfterViewInit(): void {
    this.editorsReady = true;
    this.populateEditors();
  }

  getServiceName(page: ServiceIntroPage): string {
    return this.language.currentLang === 'ar' ? page.serviceNameAr : page.serviceNameEn;
  }

  onDocsReady(form: FormGroup): void { this.docsForm = form; this.populateEditors(); }
  onFaqsReady(form: FormGroup): void { this.faqsForm = form; this.populateEditors(); }
  onVideoSelected(file: File | null): void { if (file) this.form.patchValue({ videoFileName: file.name }); }

  saveDraft(): void {
    if (!this.page) return;
    this.saving = true;
    this.servicePages.update(this.page.id, this.buildPayload()).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedAsDraft');
        this.router.navigate(['/service-pages', this.page!.id]);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'common.error');
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
        this.router.navigate(['/service-pages', this.page!.id]);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(err.error?.message || 'common.error');
      }
    });
  }

  private buildPayload() {
    return {
      description: this.form.value.description || '',
      processingDuration: this.form.value.processingDuration || '',
      videoUrl: this.form.value.videoUrl || null,
      videoFileName: this.form.value.videoFileName || null,
      documents: this.docsForm?.value.documents || [],
      faqs: this.faqsForm?.value.faqs || []
    };
  }

  private populateEditors(): void {
    if (!this.page || !this.editorsReady) return;
    setTimeout(() => {
      this.docsEditor?.setDocuments(this.page?.documents || []);
      this.faqEditor?.setFaqs(this.page?.faqs || []);
    });
  }
}
