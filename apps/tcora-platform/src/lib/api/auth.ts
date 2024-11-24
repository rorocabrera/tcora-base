// packages/core/src/lib/api/auth.ts

import { api } from './axios';
import { 
  AuthResponse, 
  LoginCredentials, 
  RefreshTokenRequest, 
  UserType,
  LoginContext
} from '@tcora/config';

export const authApi = {
  /**
   * Platform admin login
   */
  platformLogin: async (credentials: Omit<LoginCredentials, 'context'>) => {
    const response = await api.post<AuthResponse>('/auth/platform/login', {
      ...credentials,
      context: { type: UserType.PLATFORM_ADMIN }
    });
    return response.data;
  },

  /**
   * Tenant admin login
   */
  tenantAdminLogin: async (
    credentials: Omit<LoginCredentials, 'context'>, 
    tenantId: string
  ) => {
    const response = await api.post<AuthResponse>('/auth/tenant/login', {
      ...credentials,
      context: { 
        type: UserType.TENANT_ADMIN,
        tenantId 
      }
    });
    return response.data;
  },

  /**
   * End user login
   */
  endUserLogin: async (
    credentials: Omit<LoginCredentials, 'context'>,
    domain: string
  ) => {
    // First resolve domain to tenant
    const { data: tenant } = await api.get(`/tenants/resolve/${domain}`);
    
    const response = await api.post<AuthResponse>('/auth/user/login', {
      ...credentials,
      context: {
        type: UserType.END_USER,
        tenantId: tenant.id,
        domain
      }
    });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (request: RefreshTokenRequest & { context: LoginContext }) => {
    const response = await api.post<AuthResponse>('/auth/refresh', request);
    return response.data;
  },

  /**
   * Get current user profile
   */
  me: async () => {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  },

  /**
   * Impersonate user (platform admin only)
   */
  impersonate: async (targetUserId: string, targetType: UserType) => {
    const response = await api.post<AuthResponse>('/auth/impersonate', {
      targetUserId,
      targetType
    });
    return response.data;
  },

  /**
   * Stop impersonation
   */
  stopImpersonation: async () => {
    const response = await api.post<AuthResponse>('/auth/stop-impersonation');
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    await api.post('/auth/logout');
  }
};