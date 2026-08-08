import { NewsStatus } from './enums';

export interface NewsAttachment {
  id: number;
  name: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
}

export interface EmployeeNews {
  id: number;
  title: string;
  content: string;
  categoryId?: number | null;
  categoryName?: string | null;
  status: NewsStatus;
  imageUrl?: string | null;
  imageFileName?: string | null;
  attachments: NewsAttachment[];
  publishedAt?: string | null;
  createdAt: string;
  createdBy?: string | null;
  modifiedAt?: string | null;
  modifiedBy?: string | null;
}

export interface NewsEmoji {
  id: number;
  name: string;
  code: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  createdBy?: string | null;
  modifiedAt?: string | null;
  modifiedBy?: string | null;
}

export interface NewsCategory {
  id: number;
  name: string;
  displayOrder: number;
  isActive: boolean;
  emojis: NewsEmoji[];
  createdAt: string;
  createdBy?: string | null;
  modifiedAt?: string | null;
  modifiedBy?: string | null;
}

export const MAX_NEWS_ATTACHMENTS = 5;
export const MAX_NEWS_TITLE_LENGTH = 200;
export const MAX_NEWS_CONTENT_LENGTH = 4000;
export const MAX_ATTACHMENT_NAME_LENGTH = 30;
