export interface QuickLink {
  id: number;
  serviceId: number;
  systemId: number;
  serviceNameAr: string;
  serviceNameEn: string;
  systemNameAr: string;
  systemNameEn: string;
  deepLink: string;
  displayOrder: number;
  modifiedAt?: string | null;
  modifiedBy?: string | null;
}
