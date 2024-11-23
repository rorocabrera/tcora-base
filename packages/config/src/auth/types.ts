// packages/config/src/types.ts
export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  END_USER = 'END_USER',
  RESELLER = 'RESELLER'
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface FeatureFlags {
  chat: boolean;
  ticketing: boolean;
  billing: boolean;
}

export interface CustomizationConfig {
  emailTemplates: Record<string, string>;
  whiteLabelEnabled: boolean;
}

export interface TenantSettings {
  theme: ThemeConfig;
  features: FeatureFlags;
  customization: CustomizationConfig;
}

// Basic shared interfaces
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth related types
export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  resellerId?: string;
  impersonating?: {
    originalUserId: string;
    originalRole: UserRole;
  };
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}