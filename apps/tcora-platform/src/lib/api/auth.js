import { api } from './axios';

export const authApi = {
  /**
   * Platform admin login
   */
  platformLogin: async (credentials) => {
    const response = await api.post('/auth/platform/login', {
      ...credentials,
      context: { type: 'PLATFORM_ADMIN' }
    });
    return response.data; // Returns JWT token directly
  },

  /**
   * Tenant admin login
   */
  tenantAdminLogin: async (credentials, tenantId) => {
    const response = await api.post('/auth/tenant/login', {
      ...credentials,
      context: { 
        type: 'TENANT_ADMIN',
        tenantId 
      }
    });
    return response.data;
  },

  /**
   * End user login
   */
  endUserLogin: async (credentials, domain) => {
    // First resolve domain to tenant
    const { data: tenant } = await api.get(`/tenants/resolve/${domain}`);
    
    const response = await api.post('/auth/user/login', {
      ...credentials,
      context: {
        type: 'END_USER',
        tenantId: tenant.id,
        domain
      }
    });
    return response.data;
  },

  /**
   * Impersonate user (platform admin only)
   */
  impersonate: async (targetUserId, targetType) => {
    const response = await api.post('/auth/impersonate', {
      targetUserId,
      targetType
    });
    return response.data;
  },

  /**
   * Stop impersonation
   */
  stopImpersonation: async () => {
    const response = await api.post('/auth/stop-impersonation');
    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async () => {
    await api.post('/auth/logout');
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', {
      refreshToken
    });
    return response.data;
  }
};