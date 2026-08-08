import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { NewsEmojisService } from '../../../core/services/news-emojis.service';
import { NewsEmoji } from '../../../core/models/employee-news.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-category-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.createCategory" subtitle="news.categoriesSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem" (ngSubmit)="save()">
      <div class="form-group">
        <label class="form-label">{{ 'news.categoryName' | translate }} <span class="required">*</span></label>
        <input class="form-input" formControlName="name" />
      </div>
      <div class="form-group">
        <label class="form-label">{{ 'news.displayOrder' | translate }} <span class="required">*</span></label>
        <input class="form-input" type="number" min="1" formControlName="displayOrder" />
        <p class="form-helper">{{ 'news.displayOrderHint' | translate }}</p>
      </div>
      <div class="form-group">
        <label class="form-label"><input type="checkbox" formControlName="isActive" /> {{ 'common.active' | translate }}</label>
      </div>

      <div class="form-group">
        <label class="form-label">{{ 'news.assignedEmojis' | translate }}</label>
        <select class="form-select" [value]="''" (change)="onEmojiSelected($event)">
          <option value="">{{ 'news.selectEmoji' | translate }}</option>
          @for (e of availableEmojis; track e.id) {
            <option [value]="e.id">{{ e.code }} {{ e.name }}</option>
          }
        </select>
        @if (selectedEmojis.length) {
          <div class="filter-chips" style="border-top:none;padding-top:0.75rem;margin-top:0.75rem">
            @for (e of selectedEmojis; track e.id) {
              <span class="filter-chip">
                {{ e.code }} {{ e.name }}
                <button type="button" class="filter-chip__remove" (click)="removeEmoji(e.id)">✕</button>
              </span>
            }
          </div>
        }
      </div>

      <div class="form-action-bar">
        <a routerLink="/employee-news/categories" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
      </div>
    </form>
  `
})
export class NewsCategoryCreateComponent implements OnInit {
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly emojisService = inject(NewsEmojisService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  allEmojis: NewsEmoji[] = [];
  selectedEmojis: NewsEmoji[] = [];
  saving = false;

  form = this.fb.group({
    name: ['', Validators.required],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  get availableEmojis(): NewsEmoji[] {
    const selected = new Set(this.selectedEmojis.map((e) => e.id));
    return this.allEmojis.filter((e) => !selected.has(e.id));
  }

  ngOnInit(): void {
    this.categoriesService.getLookup().subscribe({
      next: (cats) => {
        const nextOrder = cats.length ? Math.max(...cats.map((c) => c.displayOrder)) + 1 : 1;
        this.form.patchValue({ displayOrder: nextOrder });
      }
    });
    this.emojisService.getLookup(true).subscribe({
      next: (items) => (this.allEmojis = items),
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  onEmojiSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    select.value = '';
    if (!id) return;
    const emoji = this.allEmojis.find((e) => e.id === id);
    if (emoji && !this.selectedEmojis.some((e) => e.id === id)) {
      this.selectedEmojis = [...this.selectedEmojis, emoji];
    }
  }

  removeEmoji(id: number): void {
    this.selectedEmojis = this.selectedEmojis.filter((e) => e.id !== id);
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.categoriesService.create({
      name: this.form.value.name!.trim(),
      displayOrder: Number(this.form.value.displayOrder),
      isActive: !!this.form.value.isActive,
      emojiIds: this.selectedEmojis.map((e) => e.id)
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedSuccessfully');
        this.router.navigate(['/employee-news/categories']);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
