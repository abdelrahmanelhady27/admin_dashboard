import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ContentType, NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';
import { forkJoin, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-news-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule, PageHeaderComponent,
    FileUploaderComponent, ConfirmDialogComponent, TranslatePipe
  ],
  template: `
    <app-page-header title="news.editTitle" subtitle="news.editSubtitle" />

    @if (loading) {
      <p>{{ 'common.loading' | translate }}</p>
    } @else if (newsId) {
      <form [formGroup]="form" class="u-card" style="padding:1.5rem">
        <div class="form-section">
          <h3 class="form-section__title">{{ 'news.basicInfo' | translate }}</h3>
          <div class="form-group">
            <label class="form-label">{{ 'news.title' | translate }} <span class="required">*</span></label>
            <input class="form-input" formControlName="title" [maxlength]="maxTitle" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'news.content' | translate }}</label>
            <textarea class="form-textarea" formControlName="content" rows="5" [maxlength]="maxContent"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'news.category' | translate }}</label>
            <select class="form-select" formControlName="categoryId">
              <option value="">{{ 'news.selectCategory' | translate }}</option>
              @for (c of categoryOptions; track c.id) {
                <option [value]="c.id">{{ c.name }}{{ !c.isActive ? ' (' + ('common.inactive' | translate) + ')' : '' }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-section">
          <h3 class="form-section__title">{{ 'news.coverImage' | translate }}</h3>
          @if (imageUrl) {
            <p class="form-helper">{{ imageFileName || imageUrl }}</p>
            <button type="button" class="btn btn-outline btn-sm" (click)="clearImage()">{{ 'common.remove' | translate }}</button>
          }
          <app-file-uploader
            [label]="'news.coverImage'"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            [allowedTypes]="['jpg','jpeg','png','webp','image/jpeg','image/png','image/webp']"
            [maxSizeMb]="3"
            (fileSelected)="onImageSelected($event)" />
        </div>

        <div class="form-section">
          <h3 class="form-section__title">{{ 'news.attachments' | translate }}</h3>
          @if (attachments.length) {
            <ul class="attachment-list">
              @for (a of attachments; track a.id; let i = $index) {
                <li>
                  <input class="form-input" [(ngModel)]="a.name" [ngModelOptions]="{standalone: true}" [maxlength]="maxAttachmentName" />
                  <span>{{ a.fileName }}</span>
                  <button type="button" class="btn btn-outline btn-sm" (click)="removeAttachment(i)">✕</button>
                </li>
              }
            </ul>
          }
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
                  <input class="form-input" [(ngModel)]="a.name" [ngModelOptions]="{standalone: true}" [maxlength]="maxAttachmentName" />
                  <span>{{ a.file.name }}</span>
                  <button type="button" class="btn btn-outline btn-sm" (click)="removePendingAttachment($index)">✕</button>
                </li>
              }
            </ul>
          }
        </div>

        <div class="form-action-bar">
          <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
          @if (currentStatus === publishedStatus) {
            <button type="button" class="btn btn-primary" [disabled]="saving || uploading" (click)="save()">{{ 'common.save' | translate }}</button>
            @if (canPublish) {
              <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="showUnpublishConfirm = true">{{ 'common.unpublish' | translate }}</button>
            }
          } @else if (canPublish) {
            <button type="button" class="btn btn-primary" [disabled]="saving || uploading" (click)="publish()">{{ 'common.publish' | translate }}</button>
          }
          <button type="button" class="btn btn-outline" [disabled]="saving || uploading" (click)="showCancelConfirm = true">{{ 'common.cancel' | translate }}</button>
        </div>
      </form>
    }

    <app-confirm-dialog
      [visible]="showCancelConfirm"
      title="common.confirm"
      message="news.confirmCancel"
      (confirmed)="confirmCancel()"
      (cancelled)="showCancelConfirm = false" />
    <app-confirm-dialog
      [visible]="showUnpublishConfirm"
      title="common.confirm"
      message="news.confirmUnpublish"
      (confirmed)="unpublish()"
      (cancelled)="showUnpublishConfirm = false" />
  `,
  styles: [`
    .attachment-list { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; gap: 0.5rem; }
    .attachment-list li { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  `]
})
export class NewsEditComponent implements OnInit {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly filesService = inject(FilesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly maxTitle = MAX_NEWS_TITLE_LENGTH;
  readonly maxContent = MAX_NEWS_CONTENT_LENGTH;
  readonly maxAttachmentName = MAX_ATTACHMENT_NAME_LENGTH;
  readonly publishedStatus = NewsStatus.Published;
  readonly canPublish = this.auth.hasPermission(ContentType.EmployeeNews, 'publish');

  newsId = 0;
  loading = true;
  saving = false;
  uploading = false;
  currentStatus: NewsStatus = NewsStatus.Draft;
  categoryOptions: NewsCategory[] = [];
  attachments: NewsAttachment[] = [];
  pendingAttachments: { name: string; file: File }[] = [];
  imageUrl: string | null = null;
  imageFileName: string | null = null;
  imageFile: File | null = null;
  clearExistingImage = false;
  showCancelConfirm = false;
  showUnpublishConfirm = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(MAX_NEWS_TITLE_LENGTH)]],
    content: ['', [Validators.maxLength(MAX_NEWS_CONTENT_LENGTH)]],
    categoryId: ['']
  });

  ngOnInit(): void {
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.categoriesService.getLookup().subscribe({
      next: (cats) => {
        this.categoryOptions = cats.filter((c) => c.isActive);
        this.loadNews();
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  private loadNews(): void {
    this.newsService.getById(this.newsId).subscribe({
      next: (item) => {
        this.currentStatus = item.status;
        this.form.patchValue({
          title: item.title,
          content: item.content,
          categoryId: item.categoryId ? String(item.categoryId) : ''
        });
        this.attachments = [...(item.attachments ?? [])];
        this.imageUrl = item.imageUrl ?? null;
        this.imageFileName = item.imageFileName ?? null;
        if (item.categoryId && !this.categoryOptions.some((c) => c.id === item.categoryId)) {
          this.categoryOptions = [
            ...this.categoryOptions,
            {
              id: item.categoryId,
              name: item.categoryName || `#${item.categoryId}`,
              displayOrder: 0,
              isActive: false,
              emojis: [],
              createdAt: item.createdAt
            }
          ];
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/employee-news']);
      }
    });
  }

  onImageSelected(file: File | null): void {
    this.imageFile = file;
    this.clearExistingImage = false;
  }

  clearImage(): void {
    this.imageUrl = null;
    this.imageFileName = null;
    this.imageFile = null;
    this.clearExistingImage = true;
  }

  onAttachmentSelected(file: File | null): void {
    if (!file) return;
    if (this.attachments.length + this.pendingAttachments.length >= MAX_NEWS_ATTACHMENTS) {
      this.toast.error('validation.maxAttachments');
      return;
    }
    this.pendingAttachments.push({ name: file.name.replace(/\.pdf$/i, '').slice(0, 30), file });
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }

  removePendingAttachment(index: number): void {
    this.pendingAttachments.splice(index, 1);
  }

  saveDraft(): void {
    this.persist({ saveAsDraft: true });
  }

  save(): void {
    this.persist({ saveAsDraft: false });
  }

  publish(): void {
    const title = this.form.value.title?.trim();
    const content = this.form.value.content?.trim();
    const categoryId = this.form.value.categoryId;
    if (!title || !content || !categoryId) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    this.persist({ saveAsDraft: false, publishAfterSave: true });
  }

  unpublish(): void {
    this.showUnpublishConfirm = false;
    this.saving = true;
    this.newsService.unpublish(this.newsId).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.unpublishedSuccessfully');
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

  private hasValidAttachmentNames(): boolean {
    const existingOk = this.attachments.every((a) => !!a.name?.trim() && a.name.trim().length <= MAX_ATTACHMENT_NAME_LENGTH);
    const pendingOk = this.pendingAttachments.every((a) => !!a.name?.trim() && a.name.trim().length <= MAX_ATTACHMENT_NAME_LENGTH);
    return existingOk && pendingOk;
  }

  private persist(options: { saveAsDraft: boolean; publishAfterSave?: boolean }): void {
    if (!this.form.get('title')?.value?.trim()) {
      this.toast.error('validation.titleRequired');
      return;
    }

    if (!this.hasValidAttachmentNames()) {
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

    forkJoin({ image: imageUpload$, uploads: attachmentUploads$ }).pipe(
      switchMap(({ image, uploads }) => {
        this.uploading = false;
        const newAttachments: NewsAttachment[] = uploads.map((uploaded, i) => ({
          id: 0,
          name: this.pendingAttachments[i].name.trim(),
          fileUrl: uploaded.url,
          fileName: uploaded.fileName,
          fileType: uploaded.fileType
        }));

        let nextImageUrl = this.imageUrl;
        let nextImageFileName = this.imageFileName;
        if (image) {
          nextImageUrl = image.url;
          nextImageFileName = image.fileName;
        } else if (this.clearExistingImage) {
          nextImageUrl = null;
          nextImageFileName = null;
        }

        const categoryId = this.form.value.categoryId ? Number(this.form.value.categoryId) : null;
        const update$ = this.newsService.update(this.newsId, {
          title: this.form.value.title!.trim(),
          content: this.form.value.content?.trim() ?? '',
          categoryId,
          imageUrl: nextImageUrl,
          imageFileName: nextImageFileName,
          attachments: [...this.attachments, ...newAttachments],
          saveAsDraft: options.saveAsDraft
        });

        return options.publishAfterSave
          ? update$.pipe(switchMap((updated) => this.newsService.publish(updated.id)))
          : update$;
      })
    ).subscribe({
      next: () => {
        this.saving = false;
        const message = options.publishAfterSave
          ? 'messages.publishedSuccessfully'
          : options.saveAsDraft
            ? 'messages.savedAsDraft'
            : 'messages.savedSuccessfully';
        this.toast.success(message);
        this.navigateBack();
      },
      error: (err) => {
        this.saving = false;
        this.uploading = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }

  private navigateBack(): void {
    if (this.route.snapshot.queryParamMap.get('returnTo') === 'list') {
      this.router.navigate(['/employee-news']);
      return;
    }
    this.router.navigate(['/employee-news', this.newsId]);
  }
}
