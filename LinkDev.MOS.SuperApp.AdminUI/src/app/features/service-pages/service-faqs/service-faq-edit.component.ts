import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceFaqsService } from '../../../core/services/service-faqs.service';
import { MAX_FAQ_ANSWER_LENGTH, MAX_FAQ_QUESTION_LENGTH } from '../../../core/models/service-page.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-faq-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, TranslatePipe],
  template: `
    <app-page-header title="servicePages.editFaq" subtitle="servicePages.faqsSubtitle" />

    @if (loading) {
      <p>{{ 'common.loading' | translate }}</p>
    } @else {
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
          <a [routerLink]="cancelLink" class="btn btn-outline">{{ 'common.cancel' | translate }}</a>
          <button type="submit" class="btn btn-primary" [disabled]="saving || form.invalid">{{ 'common.save' | translate }}</button>
        </div>
      </form>
    }
  `
})
export class ServiceFaqEditComponent implements OnInit {
  private readonly faqsService = inject(ServiceFaqsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly maxQuestion = MAX_FAQ_QUESTION_LENGTH;
  readonly maxAnswer = MAX_FAQ_ANSWER_LENGTH;
  faqId = 0;
  loading = true;
  saving = false;

  form = this.fb.group({
    question: ['', [Validators.required, Validators.maxLength(MAX_FAQ_QUESTION_LENGTH)]],
    answer: ['', [Validators.required, Validators.maxLength(MAX_FAQ_ANSWER_LENGTH)]],
    displayOrder: [1, [Validators.required, Validators.min(1)]],
    isActive: [true]
  });

  get cancelLink(): string[] {
    return this.route.snapshot.queryParamMap.get('returnTo') === 'details'
      ? ['/service-pages/faqs', String(this.faqId)]
      : ['/service-pages/faqs'];
  }

  ngOnInit(): void {
    this.faqId = Number(this.route.snapshot.paramMap.get('id'));
    this.faqsService.getById(this.faqId).subscribe({
      next: (faq) => {
        this.form.patchValue({
          question: faq.question,
          answer: faq.answer,
          displayOrder: faq.displayOrder,
          isActive: faq.isActive
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(resolveApiErrorKey(err));
        this.router.navigate(['/service-pages/faqs']);
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    this.faqsService.update(this.faqId, {
      question: this.form.value.question!.trim(),
      answer: this.form.value.answer!.trim(),
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
