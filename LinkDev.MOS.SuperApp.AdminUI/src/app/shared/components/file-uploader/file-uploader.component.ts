import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div
      class="file-uploader"
      [class.drag-over]="dragOver"
      [class.has-file]="selectedFileName"
      (dragover)="onDragOver($event)"
      (dragleave)="dragOver = false"
      (drop)="onDrop($event)">
      <div class="file-uploader__icon">📎</div>
      <label class="file-uploader__label">
        <input type="file" [accept]="accept" (change)="onFileSelected($event)" [disabled]="disabled" hidden />
        <span class="file-uploader__title">{{ label | translate }}</span>
        <span class="file-uploader__hint">{{ 'common.dragDropHint' | translate }}</span>
      </label>
      @if (selectedFileName) {
        <div class="file-uploader__file">
          <span>📄 {{ selectedFileName }}</span>
          <button type="button" class="file-uploader__remove" (click)="clearFile()">✕</button>
        </div>
      }
      @if (errorKey) {
        <div class="form-error">{{ errorKey | translate }}</div>
      }
    </div>
  `,
  styles: [`
    .file-uploader {
      border: 2px dashed var(--border-color); border-radius: var(--radius-lg);
      padding: 1.5rem; text-align: center; transition: all var(--transition-fast);
      background: var(--page-bg); cursor: pointer;
    }
    .file-uploader:hover, .file-uploader.drag-over {
      border-color: var(--primary-color); background: var(--primary-light);
    }
    .file-uploader.has-file { border-style: solid; border-color: var(--primary-color); background: var(--primary-light); }
    .file-uploader__icon { font-size: 1.5rem; margin-bottom: 0.5rem; opacity: 0.6; }
    .file-uploader__label { cursor: pointer; display: block; }
    .file-uploader__title { display: block; font-size: 0.875rem; font-weight: 500; color: var(--primary-color); }
    .file-uploader__hint { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-muted); }
    .file-uploader__file {
      display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      margin-top: 0.875rem; padding: 0.5rem 0.875rem; background: var(--card-bg);
      border-radius: var(--radius-md); font-size: 0.8125rem; color: var(--text-dark);
    }
    .file-uploader__remove { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.75rem; }
    @media (max-width: 767px) {
      .file-uploader { padding: 1.125rem 1rem; }
      .file-uploader__file { flex-wrap: wrap; word-break: break-all; }
    }
  `]
})
export class FileUploaderComponent {
  @Input() label = 'common.uploadFile';
  @Input() accept = '*/*';
  @Input() allowedTypes: string[] = [];
  @Input() maxSizeMb = 5;
  @Input() disabled = false;
  @Output() fileSelected = new EventEmitter<File | null>();

  selectedFileName = '';
  errorKey = '';
  dragOver = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = true;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver = false;
    const file = event.dataTransfer?.files?.[0] ?? null;
    this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFile(input.files?.[0] ?? null);
  }

  clearFile(): void {
    this.selectedFileName = '';
    this.errorKey = '';
    this.fileSelected.emit(null);
  }

  private processFile(file: File | null): void {
    this.errorKey = '';
    if (!file) {
      this.selectedFileName = '';
      this.fileSelected.emit(null);
      return;
    }
    if (this.allowedTypes.length && !this.allowedTypes.some((t) => file.type.includes(t) || file.name.toLowerCase().endsWith(t))) {
      this.errorKey = 'validation.unsupportedFileType';
      this.fileSelected.emit(null);
      return;
    }
    if (file.size > this.maxSizeMb * 1024 * 1024) {
      this.errorKey = 'validation.fileSizeExceeded';
      this.fileSelected.emit(null);
      return;
    }
    this.selectedFileName = file.name;
    this.fileSelected.emit(file);
  }
}
