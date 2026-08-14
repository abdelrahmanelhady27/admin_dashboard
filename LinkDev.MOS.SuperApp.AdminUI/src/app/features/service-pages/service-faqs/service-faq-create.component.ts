import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceFaqsService } from '../../../core/services/service-faqs.service';
import { MAX_FAQ_ANSWER_LENGTH, MAX_FAQ_QUESTION_LENGTH } from '../../../core/models/service-page.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-faq-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="servicePages.createFaq" subtitle="servicePages.faqsSubtitle" />

    <form [formGroup]="form" class="u-card" style="padding:1.5rem" (ngSubmit)="save()">
      <div class="form-group">
        <label class="form-label">{{ 'servicePages.faqQuestion' | translate }} <span class="required">*</span></label>
        <textarea class="form-textarea" formControlName="question" rows="2" [maxlength]="maxQuestion"></textarea>
        <div class="form-counter">{{ form.get('question')?.value?.length || 0 }}/{{ maxQuestion }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">{{ 'servicePages.faqAnswer' | translate }} <span class="required">*</span></label>
        <textarea class="form-textarea" formControlName="answer" rows="3" [maxlength]="maxAnswer"></textarea>
        <div class="form-counter">{{ form.get('answer')?.value?.length || 0 }}/{{ maxAnswer }}</div>
      </div>
      <div class="form-group">
        <label class="form-label">{{ 'servicePages.faqDisplayOrder' | translate }} <span class="required">*</span></label>
        <input class="form-input" type="number" min="1" formControlName="displayOrder" />
        <p class="form-helper">{{ 'servicePages.displayOrderHint' | translate }}</p>
      </div>
      <div class="form-group">
        <label class="form-label"><input type="checkbox" formControlName="isActive" /> {{ 'common.active' | translate }}</label>
      </div>
      <div class="form-action-bar">
        <a routerLink="/service-pages/faqs" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
        <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
      </div>
    </form>
  `
})
export class ServiceFaqCreateComponent implements OnInit {
  private readonly faqsService = inject(ServiceFaqsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly maxQuestion = MAX_FAQ_QUESTION_LENGTH;
  readonly maxAnswer = MAX_FAQ_ANSWER_LENGTH;
  saving = false;

  form = this.fb.group({
    question: ['', [Validators.required, Validators.maxLength(MAX_FAQ_QUESTION_LENGTH)]],
    answer: ['', [Validators.required, Validators.maxLength(MAX_FAQ_ANSWER_LENGTH)]],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  ngOnInit(): void {
    this.faqsService.getLookup().subscribe({
      next: (items) => {
        const nextOrder = items.length ? Math.max(...items.map((f) => f.displayOrder)) + 1 : 1;
        this.form.patchValue({ displayOrder: nextOrder });
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.faqsService.create({
      question: this.form.value.question!.trim(),
      answer: this.form.value.answer!.trim(),
      displayOrder: Number(this.form.value.displayOrder),
      isActive: !!this.form.value.isActive
    }).subscribe({
      next: () => {
        this.saving = false;
        this.toast.success('messages.savedSuccessfully');
        this.router.navigate(['/service-pages/faqs']);
      },
      error: (err) => {
        this.saving = false;
        this.toast.error(resolveApiErrorKey(err));
      }
    });
  }
}
