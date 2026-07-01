import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeNewsService } from '../../../core/services/employee-news.service';
import { EmployeeNews } from '../../../core/models/employee-news.model';
import { NewsCategory } from '../../../core/models/enums';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FileUploaderComponent } from '../../../shared/components/file-uploader/file-uploader.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-news-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, FileUploaderComponent, TranslatePipe],
  template: `
    @if (news) {
      <app-page-header title="news.editTitle" />

      <form [formGroup]="form" class="card">
        <div class="form-row">
          <label>{{ 'news.title' | translate }}</label>
          <input formControlName="title" />
        </div>
        <div class="form-row">
          <label>{{ 'news.content' | translate }}</label>
          <textarea formControlName="content" rows="5"></textarea>
        </div>
        <div class="form-row">
          <label>{{ 'news.category' | translate }}</label>
          <select formControlName="category">
            @for (c of categories; track c) {
              <option [value]="c">{{ 'newsCategories.' + c | translate }}</option>
            }
          </select>
        </div>
        <div class="form-row">
          <app-file-uploader [label]="'news.attachments'" accept="image/*,.pdf" (fileSelected)="onAttachment($event)" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-primary" (click)="save()">{{ 'common.save' | translate }}</button>
          <a [routerLink]="['/employee-news', news.id]" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        </div>
      </form>
    }
  `,
  styles: [`
    .card { background: var(--card-bg); border-radius: var(--radius-lg); padding: 1.5rem; border: 1px solid var(--border-color); }
    .form-row { margin-bottom: 1.25rem; }
    label { display: block; margin-bottom: 0.375rem; font-size: 0.8125rem; color: var(--text-muted); }
    input, select, textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
    .form-actions { display: flex; gap: 0.75rem; }
  `]
})
export class NewsEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsService = inject(EmployeeNewsService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  news: EmployeeNews | null = null;
  readonly categories = Object.values(NewsCategory);
  newAttachments: string[] = [];

  form = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    category: ['', Validators.required]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.news = this.newsService.getById(id) ?? null;
    if (this.news) {
      this.form.patchValue({
        title: this.news.title,
        content: this.news.content,
        category: this.news.category
      });
    }
  }

  onAttachment(file: File | null): void {
    if (file) this.newAttachments.push(file.name);
  }

  save(): void {
    if (!this.news || this.form.invalid) {
      this.toast.error('validation.completeRequiredFields');
      return;
    }
    const attachments = [
      ...this.news.attachments,
      ...this.newAttachments.map((name, i) => ({ id: `att-new-${i}`, fileName: name, fileType: 'file' }))
    ];
    this.newsService.update(this.news.id, {
      title: this.form.value.title!,
      content: this.form.value.content!,
      category: this.form.value.category as NewsCategory,
      attachments
    });
    this.toast.success('messages.newsUpdated');
    this.router.navigate(['/employee-news', this.news.id]);
  }
}
