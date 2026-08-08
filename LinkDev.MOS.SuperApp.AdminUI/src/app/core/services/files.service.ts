import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.dev';

export type FileCategory = 'Video' | 'Document' | 'Image';

export interface UploadedFile {
  url: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
}

@Injectable({ providedIn: 'root' })
export class FilesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/files`;

  upload(file: File, category: FileCategory): Observable<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return this.http.post<UploadedFile>(this.apiUrl, formData);
  }
}
