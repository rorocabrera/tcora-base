// packages/config/src/types.ts
export enum UserType {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  END_USER = 'END_USER',
}

export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  END_USER = 'END_USER',
  TENANT_MANAGER = 'TENANT_MANAGER',
  TENANT_VIEWER = 'TENANT_VIEWER'
}


export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}


export interface LoginContext {
  type: UserType;
  tenantId?: string;
  domain?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  context: LoginContext;
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

export interface AuthResponse {
  user: UserProfile;
  tokens: TokenPair;
}

// Auth related types
export interface JWTPayload {
  sub: string;
  email: string;
  type: UserType;
  role: UserRole;
  tenantId?: string;
  resellerId?: string;
  impersonating?: {
    originalUserId: string;
    originalType: UserType;
  };
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  type: UserType;
  role: UserRole;
  tenantId?: string;
  resellerId?: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
}

export interface TenantProfile {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  settings: Record<string, any>;
  subscription: {
    planId: string;
    status: string;
    startDate: Date;
    endDate?: Date;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}




// check 

export interface AuthToken {
  token: string;
  expiresAt: Date;
}



export interface TokenMetadata {
  issuedAt: Date;
  expiresAt: Date;
  refreshToken?: string;
}
