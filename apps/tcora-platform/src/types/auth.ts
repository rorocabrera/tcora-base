
// apps/platform/src/types/auth.ts


  export enum UserRole {
    PLATFORM_ADMIN = 'PLATFORM_ADMIN',
    TENANT_ADMIN = 'TENANT_ADMIN',
    END_USER = 'END_USER',
    RESELLER = 'RESELLER'
  }



  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
  }
  
  export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    tenantId?: string;
    resellerId?: string;
    permissions?: Record<string, any>;
  }
  
  export interface RefreshTokenRequest {
    refreshToken: string;
  }
  

  
  