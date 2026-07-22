import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAX_DOCUMENT_NAME_LENGTH, MAX_SERVICE_DOCUMENTS } from '../../../core/models/service-page.model';
import { FileUploaderComponent } from '../file-uploader/file-uploader.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-documents-editor',
  standalone: true,
  imports: [ReactiveFormsModule, FileUploaderComponent, TranslatePipe],
  template: `
    <div class="documents-editor" [formGroup]="form">
      <div formArrayName="documents">
        @for (doc of documents.controls; track $index; let i = $index) {
          <div class="doc-item" [formGroupName]="i">
            <div class="form-row">
              <label>{{ 'servicePages.documentName' | translate }}</label>
              <input formControlName="name" [maxlength]="maxNameLength" />
            </div>
            @if (!readonly) {
              <app-file-uploader
                [label]="'servicePages.uploadPdf'"
                accept=".pdf,application/pdf"
                [allowedTypes]="['pdf']"
                (fileSelected)="onFileSelected(i, $event)" />
            } @else if (doc.get('fileName')?.value) {
              <div class="file-name">{{ doc.get('fileName')?.value }}</div>
            }
            @if (!readonly) {
              <button type="button" class="btn btn-outline btn-sm" (click)="removeDoc(i)">{{ 'common.delete' | translate }}</button>
            }
          </div>
        }
      </div>
      @if (!readonly && documents.length < maxDocs) {
        <button type="button" class="btn btn-outline" (click)="addDoc()">{{ 'servicePages.addDocument' | translate }}</button>
      }
    </div>
  `,
  styles: [`
    .doc-item { border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; }
    @media (max-width: 767px) {
      .doc-item { padding: 0.875rem; }
      .doc-item .btn { width: 100%; }
    }
    .form-row { margin-bottom: 0.75rem; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.8125rem; color: var(--text-muted); }
    input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); }
    .file-name { font-size: 0.8125rem; color: var(--text-dark); margin-bottom: 0.5rem; }
  `]
})
export class DocumentsEditorComponent {
  private readonly fb = inject(FormBuilder);

  @Input() readonly = false;
  @Input() maxDocs = MAX_SERVICE_DOCUMENTS;
  @Output() formReady = new EventEmitter<FormGroup>();

  readonly maxNameLength = MAX_DOCUMENT_NAME_LENGTH;

  form = this.fb.group({ documents: this.fb.array([]) });

  get documents(): FormArray {
    return this.form.get('documents') as FormArray;
  }

  ngOnInit(): void {
    this.formReady.emit(this.form);
  }

  addDoc(): void {
    if (this.documents.length >= this.maxDocs) return;
    this.documents.push(this.fb.group({
      id: [`doc-${Date.now()}`],
      name: ['', [Validators.required, Validators.maxLength(MAX_DOCUMENT_NAME_LENGTH)]],
      fileName: [''],
      fileType: ['application/pdf'],
      fileUrl: ['']
    }));
  }

  removeDoc(index: number): void {
    this.documents.removeAt(index);
  }

  onFileSelected(index: number, file: File | null): void {
    if (!file) return;
    this.documents.at(index).patchValue({ fileName: file.name, fileType: file.type });
  }

  setDocuments(items: { id: number | string; name: string; fileName: string; fileType: string; fileUrl?: string }[]): void {
    this.documents.clear();
    items.forEach((item) => {
      this.documents.push(this.fb.group({
        id: [item.id],
        name: [item.name, [Validators.required, Validators.maxLength(MAX_DOCUMENT_NAME_LENGTH)]],
        fileName: [item.fileName],
        fileType: [item.fileType],
        fileUrl: [item.fileUrl || '']
      }));
    });
  }
}
