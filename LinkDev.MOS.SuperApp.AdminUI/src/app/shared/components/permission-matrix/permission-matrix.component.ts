import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentType } from '../../../core/models/enums';
import { PermissionSet, autoSelectView, validatePermissionSet } from '../../../core/models/permission.model';
import { LanguageService } from '../../../core/services/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-permission-matrix',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="permission-matrix">
      <table>
        <thead>
          <tr>
            <th>{{ 'users.contentType' | translate }}</th>
            @for (col of permissionCols; track col) {
              <th>{{ 'permissions.' + col | translate }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (perm of permissions; track perm.contentType) {
            <tr>
              <td>{{ 'contentTypes.' + perm.contentType | translate }}</td>
              <td><input type="checkbox" [checked]="perm.canView" [disabled]="readonly" (change)="toggle(perm.contentType, 'canView', $event)" /></td>
              <td><input type="checkbox" [checked]="perm.canCreate" [disabled]="readonly || !isSelected(perm.contentType)" (change)="toggle(perm.contentType, 'canCreate', $event)" /></td>
              <td><input type="checkbox" [checked]="perm.canEdit" [disabled]="readonly || !isSelected(perm.contentType)" (change)="toggle(perm.contentType, 'canEdit', $event)" /></td>
              <td><input type="checkbox" [checked]="perm.canDelete" [disabled]="readonly || !isSelected(perm.contentType)" (change)="toggle(perm.contentType, 'canDelete', $event)" /></td>
              <td><input type="checkbox" [checked]="perm.canPublish" [disabled]="readonly || !isSelected(perm.contentType)" (change)="toggle(perm.contentType, 'canPublish', $event)" /></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .permission-matrix { overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; }
    table { width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 520px; }
    th, td { padding: 0.625rem; border-bottom: 1px solid var(--border-color); text-align: start; }
    th { color: var(--text-muted); font-weight: 600; }
    input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--primary-color); }
  `]
})
export class PermissionMatrixComponent {
  private readonly toast = inject(ToastService);
  private readonly language = inject(LanguageService);

  @Input() permissions: PermissionSet[] = [];
  @Input() selectedContentTypes: ContentType[] = [];
  @Input() readonly = false;
  @Output() permissionsChange = new EventEmitter<PermissionSet[]>();

  readonly permissionCols = ['View', 'Create', 'Edit', 'Delete', 'Publish'];

  isSelected(contentType: ContentType): boolean {
    return this.selectedContentTypes.includes(contentType);
  }

  toggle(contentType: ContentType, field: keyof PermissionSet, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const updated = this.permissions.map((p) => {
      if (p.contentType !== contentType) {
        return p;
      }
      let next = { ...p, [field]: checked };
      if (field !== 'canView' && checked) {
        next = autoSelectView(next);
      }
      if (field === 'canView' && !checked) {
        const hasAdvanced = next.canCreate || next.canEdit || next.canDelete || next.canPublish;
        if (hasAdvanced) {
          this.toast.warning('validation.advancedRequiresView');
          return { ...p, canView: true };
        }
      }
      const error = validatePermissionSet(next);
      if (error) {
        this.toast.warning(error);
      }
      return next;
    });
    this.permissionsChange.emit(updated);
  }
}
