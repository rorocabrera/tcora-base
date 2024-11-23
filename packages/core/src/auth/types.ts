// packages/core/src/auth/types.ts

import { UserRole } from '@tcora/config';

export interface AuthToken {
    token: string;
    expiresAt: Date;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    tenantDomain?: string;
  }

  export interface JWTPayload {
    sub: string;  // user id
    tid: string;  // tenant id
    role: UserRole;
    jti?: string; // JWT ID for token tracking
  }
  
  export interface TokenMetadata {
    issuedAt: Date;
    expiresAt: Date;
    refreshToken?: string;
  }
  
// Extend your existing AuthResponse
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    tenantId: string;
  };
  token: AuthToken;
  metadata: TokenMetadata;
}