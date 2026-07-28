import { AuditActionType, AuditEntityType } from './enums';

export interface AuditLog {
  id: number;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityName: string;
  performedBy: string;
  performedAt: string;
}
