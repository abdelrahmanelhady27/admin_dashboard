import { UserStatus } from './enums';
import { PermissionSet } from './permission.model';

export interface StaticUser {
  id: number;
  fullName: string;
  email: string;
  status: UserStatus;
}

export interface DashboardUser {
  id: number;
  staticUserId: number;
  fullName: string;
  email: string;
  status: UserStatus;
  permissions: PermissionSet[];
  createdAt: string;
  modifiedAt: string;
  modifiedBy: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullNameEn: string;
  isAdmin: boolean;
}
