import { NewsCategory, NewsStatus, ReactionType } from './enums';

export interface NewsReaction {
  type: ReactionType;
  count: number;
}

export interface NewsAttachment {
  id: string;
  fileName: string;
  fileType: string;
}

export interface EmployeeNews {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  status: NewsStatus;
  attachments: NewsAttachment[];
  publishedAt: string | null;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
  viewsCount: number;
  reactions: NewsReaction[];
}
