import { UserStatus } from './enums';
import { PermissionSet } from './permission.model';

export interface DirectoryUser {
  id: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  status: UserStatus;
}

export interface DashboardUser {
  id: string;
  directoryUserId: string;
  fullNameAr: string;
  fullNameEn: string;
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
  fullNameAr: string;
  fullNameEn: string;
  isAdmin: boolean;
}
