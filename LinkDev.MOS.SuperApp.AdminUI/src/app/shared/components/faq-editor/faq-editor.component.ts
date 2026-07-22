import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAX_FAQ_ANSWER_LENGTH, MAX_FAQ_ITEMS, MAX_FAQ_QUESTION_LENGTH } from '../../../core/models/service-page.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-faq-editor',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="faq-editor" [formGroup]="form">
      <div formArrayName="faqs">
        @for (faq of faqs.controls; track $index; let i = $index) {
          <div class="faq-item" [formGroupName]="i">
            <div class="form-row">
              <label>{{ 'servicePages.faqQuestion' | translate }}</label>
              <input formControlName="question" [maxlength]="maxQuestion" />
            </div>
            <div class="form-row">
              <label>{{ 'servicePages.faqAnswer' | translate }}</label>
              <textarea formControlName="answer" rows="2" [maxlength]="maxAnswer"></textarea>
            </div>
            @if (!readonly) {
              <button type="button" class="btn btn-outline btn-sm" (click)="removeFaq(i)">{{ 'common.delete' | translate }}</button>
            }
          </div>
        }
      </div>
      @if (!readonly && faqs.length < maxItems) {
        <button type="button" class="btn btn-outline" (click)="addFaq()">{{ 'servicePages.addFaq' | translate }}</button>
      }
    </div>
  `,
  styles: [`
    .faq-item { border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; }
    @media (max-width: 767px) {
      .faq-item { padding: 0.875rem; }
      .faq-item .btn { width: 100%; margin-top: 0.25rem; }
    }
    .form-row { margin-bottom: 0.75rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.8125rem; color: var(--text-muted); }
    input, textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
  `]
})
export class FaqEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  @Input() readonly = false;
  @Output() formReady = new EventEmitter<FormGroup>();

  readonly maxItems = MAX_FAQ_ITEMS;
  readonly maxQuestion = MAX_FAQ_QUESTION_LENGTH;
  readonly maxAnswer = MAX_FAQ_ANSWER_LENGTH;

  form = this.fb.group({ faqs: this.fb.array([]) });

  get faqs(): FormArray {
    return this.form.get('faqs') as FormArray;
  }

  ngOnInit(): void {
    this.formReady.emit(this.form);
  }

  addFaq(): void {
    if (this.faqs.length >= MAX_FAQ_ITEMS) return;
    this.faqs.push(this.fb.group({
      id: [`faq-${Date.now()}`],
      question: ['', Validators.maxLength(MAX_FAQ_QUESTION_LENGTH)],
      answer: ['', Validators.maxLength(MAX_FAQ_ANSWER_LENGTH)]
    }));
  }

  removeFaq(index: number): void {
    this.faqs.removeAt(index);
  }

  setFaqs(items: { id: number | string; question: string; answer: string }[]): void {
    this.faqs.clear();
    items.forEach((item) => {
      this.faqs.push(this.fb.group({
        id: [item.id],
        question: [item.question, Validators.maxLength(MAX_FAQ_QUESTION_LENGTH)],
        answer: [item.answer, Validators.maxLength(MAX_FAQ_ANSWER_LENGTH)]
      }));
    });
  }
}
