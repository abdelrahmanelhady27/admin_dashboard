import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { NewsCategory, NewsStatus } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-news-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.createTitle" subtitle="news.createSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem">
      <div class="form-section">
        <h3 class="form-section__title">{{ 'news.basicInfo' | translate }}</h3>
        <div class="form-group">
          <label class="form-label">{{ 'news.title' | translate }} <span class="required">*</span></label>
          <input class="form-input" formControlName="title" />
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'news.content' | translate }} <span class="required">*</span></label>
          <textarea class="form-textarea" formControlName="content" rows="5"></textarea>
          <p class="form-helper">{{ 'news.contentHint' | translate }}</p>
        </div>
        <div class="form-group">
          <label class="form-label">{{ 'news.category' | translate }} <span class="required">*</span></label>
          <select class="form-select" formControlName="category">
            <option value="">{{ 'news.selectCategory' | translate }}</option>
            @for (c of categories; track c) {
              <option [value]="c">{{ 'newsCategories.' + c | translate }}</option>
            }
          </select>
        </div>
      </div>
      <div class="form-section">
        <h3 class="form-section__title">{{ 'news.attachments' | translate }}</h3>
        <app-file-uploader [label]="'news.attachments'" accept="image/*,.pdf" (fileSelected)="onAttachment($event)" />
        @if (attachments.length) {
          <ul class="attachment-list">@for (a of attachments; track a) { <li>{{ a }}</li> }</ul>
        }
      </div>
      <div class="form-action-bar">
        <a routerLink="/employee-news" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="button" class="btn btn-outline" (click)="saveDraft()">{{ 'common.saveAsDraft' | translate }}</button>
        <button type="button" class="btn btn-primary" (click)="publish()">{{ 'common.publish' | translate }}</button>
      </div>
    </form>
  `,
  styles: [`
    .attachment-list { margin: 0.75rem 0 0; padding-inline-start: 1.25rem; font-size: 0.8125rem; color: var(--text-muted); }
  `]
})
export class NewsCreateComponent {
  private readonly newsService = inject(EmployeeNewsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly categories = Object.values(NewsCategory);
  attachments: string[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    category: ['', Validators.required]
  });

  onAttachment(file: File | null): void {
    if (file) this.attachments.push(file.name);
  }

  saveDraft(): void {
    if (!this.form.get('title')?.value) {
      this.toast.error('validation.titleRequired');
      return;
    }
    this.create(NewsStatus.Draft);
    this.toast.success('messages.savedAsDraft');
    this.router.navigate(['/employee-news']);
  }

  publish(): void {
    if (this.form.invalid) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    const item = this.create(NewsStatus.Draft);
    this.newsService.publish(item.id);
    this.toast.success('messages.publishedSuccessfully');
    this.router.navigate(['/employee-news']);
  }

  private create(status: NewsStatus) {
    return this.newsService.create({
      title: this.form.value.title!,
      content: this.form.value.content || '',
      category: this.form.value.category as NewsCategory,
      status,
      attachments: this.attachments.map((name, i) => ({ id: `att-${i}`, fileName: name, fileType: 'file' }))
    });
  }
}
