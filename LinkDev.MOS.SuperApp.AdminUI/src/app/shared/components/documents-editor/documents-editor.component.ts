import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAX_DOCUMENT_NAME_LENGTH, MAX_SERVICE_DOCUMENTS } from '../../../core/models/service-page.model';
import { FilesService } from '../../../core/services/files.service';
import { ToastService } from '../../../core/services/toast.service';
import { resolveApiErrorKey } from '../../../core/utils/api-error.util';
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
                [maxSizeMb]="10"
                (fileSelected)="onFileSelected(i, $event)" />
            }
            @if (doc.get('fileName')?.value) {
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
    .file-name { font-size: 0.8125rem; color: var(--text-muted); margin: 0.5rem 0; word-break: break-all; }
  `]
})
export class DocumentsEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly filesService = inject(FilesService);
  private readonly toast = inject(ToastService);

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
    if (!file) {
      this.documents.at(index).patchValue({ fileName: '', fileUrl: '', fileType: 'application/pdf' });
      return;
    }
    this.filesService.upload(file, 'Document').subscribe({
      next: (uploaded) => {
        const currentName = String(this.documents.at(index).get('name')?.value || '').trim();
        const patch: Record<string, string> = {
          fileName: uploaded.fileName,
          fileType: uploaded.fileType || 'application/pdf',
          fileUrl: uploaded.url
        };
        if (!currentName) {
          patch['name'] = this.deriveDocumentName(file.name);
        }
        this.documents.at(index).patchValue(patch);
      },
      error: (err) => {
        this.documents.at(index).patchValue({ fileName: '', fileUrl: '', fileType: 'application/pdf' });
        this.toast.error(resolveApiErrorKey(err, 'validation.unsupportedFileType'));
      }
    });
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

  private deriveDocumentName(fileName: string): string {
    const base = fileName.replace(/\.[^/.]+$/, '').trim() || fileName.trim();
    return base.slice(0, MAX_DOCUMENT_NAME_LENGTH);
  }
}
