import { ContentType } from './enums';

export interface PermissionSet {
  contentType: ContentType;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canPublish: boolean;
}

export function createEmptyPermissionSet(contentType: ContentType): PermissionSet {
  return {
    contentType,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canPublish: false
  };
}

export function validatePermissionSet(perm: PermissionSet): string | null {
  const hasAdvanced = perm.canCreate || perm.canEdit || perm.canDelete || perm.canPublish;
  if (hasAdvanced && !perm.canView) {
    return 'validation.advancedRequiresView';
  }
  return null;
}

export function autoSelectView(perm: PermissionSet): PermissionSet {
  const hasAdvanced = perm.canCreate || perm.canEdit || perm.canDelete || perm.canPublish;
  if (hasAdvanced && !perm.canView) {
    return { ...perm, canView: true };
  }
  return perm;
}
