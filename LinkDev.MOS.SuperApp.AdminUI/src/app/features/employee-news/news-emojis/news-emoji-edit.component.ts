import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsEmojisService } from '../../../core/services/news-emojis.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-emoji-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.editEmoji" subtitle="news.emojisSubtitle" />

    @if (loading) {
      <p>{{ 'common.loading' | translate }}</p>
    } @else {
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
          <a [routerLink]="cancelLink" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
          <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
        </div>
      </form>
    }
  `
})
export class NewsEmojiEditComponent implements OnInit {
  private readonly emojisService = inject(NewsEmojisService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  emojiId = 0;
  loading = true;
  saving = false;

  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  get cancelLink(): string[] {
    return this.route.snapshot.queryParamMap.get('returnTo') === 'details'
      ? ['/employee-news/emojis', String(this.emojiId)]
      : ['/employee-news/emojis'];
  }

  ngOnInit(): void {
    this.emojiId = Number(this.route.snapshot.paramMap.get('id'));
    this.emojisService.getById(this.emojiId).subscribe({
      next: (emoji) => {
        this.form.patchValue({
          name: emoji.name,
          code: emoji.code,
          displayOrder: emoji.displayOrder,
          isActive: emoji.isActive
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/employee-news/emojis']);
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.emojisService.update(this.emojiId, {
      name: this.form.value.name!.trim(),
      code: this.form.value.code!.trim(),
      displayOrder: Number(this.form.value.displayOrder),
      isActive: !!this.form.value.isActive
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedSuccessfully');
        this.router.navigate(this.cancelLink);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
