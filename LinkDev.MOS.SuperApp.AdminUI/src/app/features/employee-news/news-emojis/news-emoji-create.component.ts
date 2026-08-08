import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NewsEmojisService } from '../../../core/services/news-emojis.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-emoji-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.createEmoji" subtitle="news.emojisSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem" (ngSubmit)="save()">
      <div class="form-group">
        <label class="form-label">{{ 'news.emojiName' | translate }} <span class="required">*</span></label>
        <input class="form-input" formControlName="name" />
      </div>
      <div class="form-group">
        <label class="form-label">{{ 'news.emojiCode' | translate }} <span class="required">*</span></label>
        <input class="form-input" formControlName="code" />
      </div>
      <div class="form-group">
        <label class="form-label">{{ 'news.displayOrder' | translate }} <span class="required">*</span></label>
        <input class="form-input" type="number" min="1" formControlName="displayOrder" />
        <p class="form-helper">{{ 'news.displayOrderHint' | translate }}</p>
      </div>
      <div class="form-group">
        <label class="form-label"><input type="checkbox" formControlName="isActive" /> {{ 'common.active' | translate }}</label>
      </div>
      <div class="form-action-bar">
        <a routerLink="/employee-news/emojis" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
      </div>
    </form>
  `
})
export class NewsEmojiCreateComponent implements OnInit {
  private readonly emojisService = inject(NewsEmojisService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  saving = false;
  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.emojisService.getLookup().subscribe({
      next: (items) => {
        const nextOrder = items.length ? Math.max(...items.map((e) => e.displayOrder)) + 1 : 1;
        this.form.patchValue({ displayOrder: nextOrder });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.emojisService.create({
      name: this.form.value.name!.trim(),
      code: this.form.value.code!.trim(),
      displayOrder: Number(this.form.value.displayOrder),
      isActive: !!this.form.value.isActive
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedSuccessfully');
        this.router.navigate(['/employee-news/emojis']);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
