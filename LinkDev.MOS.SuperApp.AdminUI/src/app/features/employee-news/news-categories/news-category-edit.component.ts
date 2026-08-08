import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NewsCategoriesService } from '../../../core/services/news-categories.service';
import { NewsEmojisService } from '../../../core/services/news-emojis.service';
import { NewsEmoji } from '../../../core/models/employee-news.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-news-category-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="news.editCategory" subtitle="news.categoriesSubtitle" />

    @if (loading) {
      <p>{{ 'common.loading' | translate }}</p>
    } @else {
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
          <a [routerLink]="cancelLink" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
          <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
        </div>
      </form>
    }
  `
})
export class NewsCategoryEditComponent implements OnInit {
  private readonly categoriesService = inject(NewsCategoriesService);
  private readonly emojisService = inject(NewsEmojisService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  categoryId = 0;
  loading = true;
  saving = false;
  allEmojis: NewsEmoji[] = [];
  selectedEmojis: NewsEmoji[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  get availableEmojis(): NewsEmoji[] {
    const selected = new Set(this.selectedEmojis.map((e) => e.id));
    return this.allEmojis.filter((e) => !selected.has(e.id));
  }

  get cancelLink(): string[] {
    return this.route.snapshot.queryParamMap.get('returnTo') === 'details'
      ? ['/employee-news/categories', String(this.categoryId)]
      : ['/employee-news/categories'];
  }

  ngOnInit(): void {
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      category: this.categoriesService.getById(this.categoryId),
      emojis: this.emojisService.getLookup(true)
    }).subscribe({
      next: ({ category, emojis }) => {
        this.allEmojis = emojis;
        this.form.patchValue({
          name: category.name,
          displayOrder: category.displayOrder,
          isActive: category.isActive
        });
        this.selectedEmojis = [...(category.emojis ?? [])];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/employee-news/categories']);
      }
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
    this.categoriesService.update(this.categoryId, {
      name: this.form.value.name!.trim(),
      displayOrder: Number(this.form.value.displayOrder),
      isActive: !!this.form.value.isActive,
      emojiIds: this.selectedEmojis.map((e) => e.id)
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
