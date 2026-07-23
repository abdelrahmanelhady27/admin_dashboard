import { PageStatus } from './enums';

export interface ServiceDocument {
  id: number | string;
  name: string;
  fileName: string;
  fileType: string;
  fileUrl?: string;
}

export interface FaqItem {
  id: number | string;
  question: string;
  answer: string;
}

export interface ServiceIntroPage {
  id: number;
  serviceId: number;
  serviceNameAr: string;
  serviceNameEn: string;
  status: PageStatus;
  description: string;
  processingDuration: string;
  videoUrl: string;
  videoFileName: string;
  documents: ServiceDocument[];
  faqs: FaqItem[];
  publishedSnapshot?: Partial<ServiceIntroPage>;
  createdAt: string;
  modifiedAt: string;
  modifiedBy: string;
  publishedAt?: string;
}

export interface LinkedSystem {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface LinkedService {
  id: string;
  systemId: string;
  nameAr: string;
  nameEn: string;
  deepLink: string;
  isActive: boolean;
}

export interface AvailableLinkedService {
  id: number;
  systemId: number;
  nameAr: string;
  nameEn: string;
  deepLink: string;
  isActive: boolean;
  systemNameAr?: string;
  systemNameEn?: string;
}

export const MAX_SERVICE_DOCUMENTS = 5;
export const MAX_FAQ_ITEMS = 10;
export const MAX_DESCRIPTION_LENGTH = 190;
export const MAX_PROCESSING_DURATION_LENGTH = 20;
export const MAX_DOCUMENT_NAME_LENGTH = 30;
export const MAX_FAQ_QUESTION_LENGTH = 150;
export const MAX_FAQ_ANSWER_LENGTH = 150;
