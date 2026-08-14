import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ServiceFaqsService } from '../../../core/services/service-faqs.service';
import { MAX_FAQ_ITEMS, ServiceFaq } from '../../../core/models/service-page.model';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';

@Component({
  selector: 'app-faq-picker',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="faq-picker">
      <select class="form-select" [value]="''" (change)="onFaqSelected($event)" [disabled]="selectedFaqs.length >= maxItems">
        <option value="">{{ 'servicePages.selectFaq' | translate }}</option>
        @for (f of availableFaqs; track f.id) {
          <option [value]="f.id">{{ f.question }}</option>
        }
      </select>
      @if (selectedFaqs.length) {
        <div class="filter-chips" style="border-top:none;padding-top:0.75rem;margin-top:0.75rem">
          @for (f of selectedFaqs; track f.id) {
            <span class="filter-chip">
              {{ f.question }}
              <button type="button" class="filter-chip__remove" (click)="removeFaq(f.id)">✕</button>
            </span>
          }
        </div>
      }
      <p class="form-helper">{{ selectedFaqs.length }}/{{ maxItems }}</p>
    </div>
  `
})
export class FaqPickerComponent implements OnInit {
  private readonly faqsService = inject(ServiceFaqsService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  @Output() formReady = new EventEmitter<FormGroup>();

  readonly maxItems = MAX_FAQ_ITEMS;
  allFaqs: ServiceFaq[] = [];
  selectedFaqs: ServiceFaq[] = [];

  form = this.fb.group({
    faqIds: this.fb.control<number[]>([])
  });

  get availableFaqs(): ServiceFaq[] {
    const selected = new Set(this.selectedFaqs.map((f) => f.id));
    return this.allFaqs.filter((f) => !selected.has(f.id));
  }

  ngOnInit(): void {
    this.formReady.emit(this.form);
    this.faqsService.getLookup(true).subscribe({
      next: (items) => {
        this.allFaqs = items;
        this.syncSelectedFromIds(this.form.value.faqIds ?? []);
      },
      error: (err) => this.toast.error(resolveApiErrorKey(err))
    });
  }

  onFaqSelected(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    select.value = '';
    if (!id || this.selectedFaqs.length >= MAX_FAQ_ITEMS) return;
    const faq = this.allFaqs.find((f) => f.id === id);
    if (faq && !this.selectedFaqs.some((f) => f.id === id)) {
      this.selectedFaqs = [...this.selectedFaqs, faq];
      this.syncForm();
    }
  }

  removeFaq(id: number): void {
    this.selectedFaqs = this.selectedFaqs.filter((f) => f.id !== id);
    this.syncForm();
  }

  setFaqIds(ids: number[]): void {
    this.form.patchValue({ faqIds: [...ids] });
    this.syncSelectedFromIds(ids);
  }

  private syncSelectedFromIds(ids: number[]): void {
    if (!this.allFaqs.length) {
      this.form.patchValue({ faqIds: [...ids] }, { emitEvent: false });
      return;
    }
    const idSet = new Set(ids);
    this.selectedFaqs = this.allFaqs.filter((f) => idSet.has(f.id));
    this.syncForm();
  }

  private syncForm(): void {
    this.form.patchValue({ faqIds: this.selectedFaqs.map((f) => f.id) });
  }
}
