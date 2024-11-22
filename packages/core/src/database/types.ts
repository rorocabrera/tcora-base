export interface Tenant {
    id: string;
    name: string;
    domain: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings: TenantSettings;
  }
  
  export interface TenantSettings {
    theme: ThemeConfig;
    features: FeatureFlags;
    customization: CustomizationConfig;
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
  
  export interface User {
    id: string;
    tenantId: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
  }
  
  export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER',
  }