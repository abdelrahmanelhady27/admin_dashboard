export enum PermissionType {
  View = 'View',
  Create = 'Create',
  Edit = 'Edit',
  Delete = 'Delete',
  Publish = 'Publish'
}

export const AppRoles = {
  SuperAdmin: 'SuperAdmin',
  Admin: 'Admin'
} as const;

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];

export enum ContentType {
  ServiceIntroPage = 'ServiceIntroPage',
  QuickLinks = 'QuickLinks',
  EmployeeNews = 'EmployeeNews',
  AuditLog = 'AuditLog'
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended'
}

export enum PageStatus {
  Draft = 'Draft',
  Published = 'Published',
  Unpublished = 'Unpublished'
}

export enum NewsStatus {
  Draft = 'Draft',
  Published = 'Published',
  Unpublished = 'Unpublished'
}

export enum NewsCategory {
  CongratulationsHonoring = 'CongratulationsHonoring',
  SocialEvents = 'SocialEvents',
  AchievementsProjects = 'AchievementsProjects',
  PersonalEvents = 'PersonalEvents',
  GeneralNews = 'GeneralNews'
}

export enum ReactionType {
  Like = 'Like',
  Celebrate = 'Celebrate',
  Support = 'Support',
  Sad = 'Sad',
  Thanks = 'Thanks'
}

export enum AuditActionType {
  Create = 'Create',
  Update = 'Update',
  Delete = 'Delete',
  Publish = 'Publish',
  Unpublish = 'Unpublish',
  Suspend = 'Suspend',
  Activate = 'Activate'
}

export enum AuditEntityType {
  User = 'User',
  ServiceIntroPage = 'ServiceIntroPage',
  QuickLinks = 'QuickLinks',
  EmployeeNews = 'EmployeeNews'
}

export type DisplayStatus =
  | UserStatus
  | PageStatus
  | NewsStatus
  | 'Deleted'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Closed';
