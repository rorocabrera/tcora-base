// apps/platform/src/types/tenant.ts
import { TenantSettings } from '@tcora/config';
  
export interface TenantListItem {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantDetails extends TenantListItem {
  settings: TenantSettings;
  statistics: {
    totalUsers: number;
    activeUsers: number;
    storageUsed: number;
  };
}

export interface CreateTenantDto {
  name: string;
  domain: string;
  settings: Partial<TenantSettings>;
}