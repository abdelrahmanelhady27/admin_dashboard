import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentType } from '../../../core/models/enums';
import {
  PermissionSet,
  autoSelectView,
} from '../../../core/models/permission.model';
import { TranslatePipe } from '../../pipes/translate.pipe';

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
          @for (perm of permissions; track getContentType(perm)) {
            <tr>
              <td>{{ 'contentTypes.' + getContentType(perm) | translate }}</td>
              <td>
                <input
                  type="checkbox"
                  [checked]="perm.canView"
                  [disabled]="readonly || hasAdvanced(perm)"
                  (change)="toggle(getContentType(perm), 'canView', $event)"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  [checked]="perm.canCreate"
                  [disabled]="readonly || !isSelected(getContentType(perm))"
                  (change)="toggle(getContentType(perm), 'canCreate', $event)"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  [checked]="perm.canEdit"
                  [disabled]="readonly || !isSelected(getContentType(perm))"
                  (change)="toggle(getContentType(perm), 'canEdit', $event)"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  [checked]="perm.canDelete"
                  [disabled]="readonly || !isSelected(getContentType(perm))"
                  (change)="toggle(getContentType(perm), 'canDelete', $event)"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  [checked]="perm.canPublish"
                  [disabled]="readonly || !isSelected(getContentType(perm))"
                  (change)="toggle(getContentType(perm), 'canPublish', $event)"
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .permission-matrix {
        overflow-x: auto;
        max-width: 100%;
        -webkit-overflow-scrolling: touch;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
        min-width: 520px;
      }
      th,
      td {
        padding: 0.625rem;
        border-bottom: 1px solid var(--border-color);
        text-align: start;
      }
      th {
        color: var(--text-muted);
        font-weight: 600;
      }
      input[type='checkbox'] {
        width: 16px;
        height: 16px;
        accent-color: var(--primary-color);
      }
      input[type='checkbox']:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    `,
  ],
})
export class PermissionMatrixComponent {
  @Input() permissions: PermissionSet[] = [];
  @Input() selectedContentTypes: ContentType[] = [];
  @Input() readonly = false;
  @Output() permissionsChange = new EventEmitter<PermissionSet[]>();

  readonly permissionCols = ['View', 'Create', 'Edit', 'Delete', 'Publish'];

  getContentType(perm: PermissionSet): ContentType {
    return perm.contentType ?? perm.feature!;
  }

  isSelected(contentType: ContentType): boolean {
    return this.selectedContentTypes.includes(contentType);
  }

  hasAdvanced(perm: PermissionSet): boolean {
    return perm.canCreate || perm.canEdit || perm.canDelete || perm.canPublish;
  }

  toggle(
    contentType: ContentType,
    field: keyof PermissionSet,
    event: Event,
  ): void {
    const checked = (event.target as HTMLInputElement).checked;
    const updated = this.permissions.map((p) => {
      if (this.getContentType(p) !== contentType) {
        return p;
      }

      // View cannot be cleared while any advanced permission is on.
      if (field === 'canView' && !checked && this.hasAdvanced(p)) {
        return { ...p, canView: true, contentType, feature: contentType };
      }

      let next: PermissionSet = {
        ...p,
        [field]: checked,
        contentType,
        feature: contentType,
      };

      // Checking Create/Edit/Delete/Publish always turns View on.
      if (field !== 'canView' && checked) {
        next = autoSelectView(next);
      }

      if (field !== 'canView' && !checked && !this.hasAdvanced(next)) {
        next = { ...next, canView: false };
      }

      return next;
    });
    this.permissionsChange.emit(updated);
  }
}
