export enum PermissionType {
  View = 'View',
  Create = 'Create',
  Edit = 'Edit',
  Delete = 'Delete',
  Publish = 'Publish'
}

export enum ContentType {
  ServicePages = 'ServicePages',
  QuickLinks = 'QuickLinks',
  EmployeeNews = 'EmployeeNews',
  GeneralContent = 'GeneralContent'
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

export enum AuditAction {
  AddUser = 'AddUser',
  EditUserPermissions = 'EditUserPermissions',
  DeleteUser = 'DeleteUser',
  SuspendUser = 'SuspendUser',
  CreateServicePage = 'CreateServicePage',
  EditServicePage = 'EditServicePage',
  PublishServicePage = 'PublishServicePage',
  UnpublishServicePage = 'UnpublishServicePage',
  SaveQuickLinks = 'SaveQuickLinks',
  CreateNews = 'CreateNews',
  EditNews = 'EditNews',
  PublishNews = 'PublishNews',
  UnpublishNews = 'UnpublishNews',
  DeleteNews = 'DeleteNews'
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
