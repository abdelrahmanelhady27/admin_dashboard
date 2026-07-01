import { AuditAction } from './enums';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityName: string;
  performedBy: string;
  performedAt: string;
}
