// packages/core/src/database/types.ts
import { BaseEntity, UserRole, TenantSettings } from '@tcora/config';

export interface Tenant extends BaseEntity {
  name: string;
  domain: string;
  isActive: boolean;
  settings: TenantSettings;
}

export interface User extends BaseEntity {
  tenantId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  permissions?: Record<string, any>;
  resellerId?: string;
}

export interface TenantContext {
  id: string;
  schemaName: string;
  settings: TenantSettings;
}

// Type guards
export const isTenant = (value: unknown): value is Tenant => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'domain' in value &&
    'isActive' in value
  );
};