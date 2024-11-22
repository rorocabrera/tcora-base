export interface AuthToken {
    token: string;
    expiresAt: Date;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
    tenantDomain?: string;
  }
  
  export interface AuthResponse {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    token: AuthToken;
  }