import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { FilesService } from '../../../core/services/files.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  MAX_ATTACHMENT_NAME_LENGTH,
  MAX_NEWS_ATTACHMENTS,
  MAX_NEWS_CONTENT_LENGTH,
  MAX_NEWS_TITLE_LENGTH,
  NewsAttachment,
  NewsCategory
} from '../../../core/models/employee-news.model';
import { ContentType } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-news-create',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink, PageHeaderComponent, FileUploaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.createTitle" subtitle="news.createSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem">
      <div class="form-section">
        <h3 class="form-section__title">{{ 'news.basicInfo' | translate }}</h3>
        <div class="form-group">
          <label class="form-label">{{ 'news.title' | translate }} <span class="required">*</span></label>
          <input class="form-input" formControlName="title" [maxlength]="maxTitle" />
          <div class="form-counter">{{ form.get('title')?.value?.length || 0 }}/{{ maxTitle }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'news.content' | translate }}</label>
          <textarea class="form-textarea" formControlName="content" rows="5" [maxlength]="maxContent"></textarea>
          <div class="form-counter">{{ form.get('content')?.value?.length || 0 }}/{{ maxContent }}</div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'news.category' | translate }}</label>
          <select class="form-select" formControlName="categoryId">
            <option value="">{{ 'news.selectCategory' | translate }}</option>
            @for (c of categories; track c.id) {
              <option [value]="c.id">{{ c.name }}</option>
            }
          </select>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section__title">{{ 'news.coverImage' | translate }}</h3>
        <app-file-uploader
          [label]="'news.coverImage'"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          [allowedTypes]="['jpg','jpeg','png','webp','image/jpeg','image/png','image/webp']"
          [maxSizeMb]="3"
          (fileSelected)="onImageSelected($event)" />
        @if (imageFileName) {
          <p class="form-helper">{{ imageFileName }}</p>
        }
      </div>

      <div class="form-section">
        <h3 class="form-section__title">{{ 'news.attachments' | translate }}</h3>
        <app-file-uploader
          [label]="'news.attachments'"
          accept=".pdf,application/pdf"
          [allowedTypes]="['pdf','application/pdf']"
          [maxSizeMb]="10"
          (fileSelected)="onAttachmentSelected($event)" />
        @if (pendingAttachments.length) {
          <ul class="attachment-list">
            @for (a of pendingAttachments; track $index) {
              <li>
                <input class="form-input" [(ngModel)]="a.name" [ngModelOptions]="{standalone: true}" [maxlength]="maxAttachmentName" [placeholder]="'news.attachmentName' | translate" />
                <span>{{ a.file.name }}</span>
                <button type="button" class="btn btn-outline btn-sm" (click)="removePendingAttachment($index)">✕</button>
              </li>
            }
          </ul>
        }
      </div>

      <div class="form-action-bar">
        <a routerLink="/employee-news" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
        @if (canPublish) {
          <button type="button" class="btn btn-primary" [disabled]="saving || uploading" (click)="publish()">{{ 'common.publish' | translate }}</button>
        }
      </div>
    </form>
  `,
  styles: [`
    .attachment-list { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; gap: 0.5rem; }
    .attachment-list li { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  `]
})
export class NewsCreateComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly filesService = inject(FilesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly maxTitle = MAX_NEWS_TITLE_LENGTH;
  readonly maxContent = MAX_NEWS_CONTENT_LENGTH;
  readonly maxAttachmentName = MAX_ATTACHMENT_NAME_LENGTH;
  readonly canPublish = this.auth.hasPermission(ContentType.EmployeeNews, 'publish');

  categories: NewsCategory[] = [];
  imageFile: File | null = null;
  imageFileName = '';
  pendingAttachments: { name: string; file: File }[] = [];
  saving = false;
  uploading = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(MAX_NEWS_TITLE_LENGTH)]],
    content: ['', [Validators.maxLength(MAX_NEWS_CONTENT_LENGTH)]],
    categoryId: ['']
  });

  ngOnInit(): void {
    this.categoriesService.getLookup(true).subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  onImageSelected(file: File | null): void {
    this.imageFile = file;
    this.imageFileName = file?.name ?? '';
  }

  onAttachmentSelected(file: File | null): void {
    if (!file) return;
    if (this.pendingAttachments.length >= MAX_NEWS_ATTACHMENTS) {
      this.toast.error('validation.maxAttachments');
      return;
    }
    this.pendingAttachments.push({ name: file.name.replace(/\.pdf$/i, '').slice(0, 30), file });
  }

  removePendingAttachment(index: number): void {
    this.pendingAttachments.splice(index, 1);
  }

  saveDraft(): void {
    if (!this.form.get('title')?.value?.trim()) {
      this.toast.error('validation.titleRequired');
      return;
    }
    this.submit(false);
  }

  publish(): void {
    if (this.form.invalid || !this.form.value.content?.trim() || !this.form.value.categoryId) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    this.submit(true);
  }

  private submit(publish: boolean): void {
    if (!this.pendingAttachments.every((a) => !!a.name?.trim() && a.name.trim().length <= MAX_ATTACHMENT_NAME_LENGTH)) {
      this.toast.error('validation.attachmentNameRequired');
      return;
    }

    this.saving = true;
    this.uploading = true;

    const imageUpload$ = this.imageFile
      ? this.filesService.upload(this.imageFile, 'Image')
      : of(null);

    const attachmentUploads$ = this.pendingAttachments.length
      ? forkJoin(this.pendingAttachments.map((a) => this.filesService.upload(a.file, 'Document')))
      : of([]);

    forkJoin({ image: imageUpload$, attachments: attachmentUploads$ }).subscribe({
      next: ({ image, attachments }) => {
        this.uploading = false;
        const categoryId = this.form.value.categoryId ? Number(this.form.value.categoryId) : null;
        const mappedAttachments: NewsAttachment[] = attachments.map((uploaded, i) => ({
          id: 0,
          name: this.pendingAttachments[i].name.trim(),
          fileUrl: uploaded.url,
          fileName: uploaded.fileName,
          fileType: uploaded.fileType
        }));

        this.newsService.create({
          title: this.form.value.title!.trim(),
          content: this.form.value.content?.trim() ?? '',
          categoryId,
          imageUrl: image?.url ?? null,
          imageFileName: image?.fileName ?? null,
          attachments: mappedAttachments,
          publish
        }).subscribe({
          next: () => {
            this.saving = false;
            this.toast.success(publish ? 'messages.publishedSuccessfully' : 'messages.savedAsDraft');
            this.router.navigate(['/employee-news']);
          },
          error: (err) => {
            this.saving = false;
            this.toast.error(resolveApiErrorKey(err));
          }
        });
      },
      error: (err) => {
        this.saving = false;
        this.uploading = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
