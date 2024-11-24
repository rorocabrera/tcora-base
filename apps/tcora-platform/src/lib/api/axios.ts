// apps/platform/src/lib/api/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { authApi } from './auth';
import { JWTPayload, UserType } from '@tcora/config';

const REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

// Create axios instance
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track token refresh
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const getTokenContext = (token: string) => {
  const decoded = jwtDecode<JWTPayload>(token);
  return {
    type: decoded.type,
    tenantId: decoded.tenantId,
  };
};

const shouldRefreshToken = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp! - now < REFRESH_THRESHOLD;
  } catch {
    return false;
  }
};

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      return config;
    }

    // Check if token needs refresh
    if (shouldRefreshToken(accessToken) && !config.url?.includes('/auth/refresh')) {
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            const context = getTokenContext(accessToken);
            const { tokens } = await authApi.refreshToken({ 
              refreshToken,
              context
            });
            
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
            
            onTokenRefreshed(tokens.accessToken);
            isRefreshing = false;
            
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return config;
          }
        }

        // Wait for token refresh
        const newToken = await new Promise<string>((resolve) => {
          subscribeTokenRefresh(resolve);
        });

        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      } catch (error) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/platform/login';
        return Promise.reject(error);
      }
    }

    // Add token to request
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 errors (except for refresh token requests)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Get user type from token if available
      const accessToken = localStorage.getItem('accessToken');
      let loginPath = '/platform/login';

      if (accessToken) {
        try {
          const decoded = jwtDecode<JWTPayload>(accessToken);
          loginPath = decoded.type === UserType.TENANT_ADMIN
            ? '/admin/login'
            : decoded.type === UserType.END_USER
            ? '/login'
            : '/platform/login';
        } catch {
          // If token is invalid, default to platform login
        }
      }

      window.location.href = loginPath;
    }

    return Promise.reject(error);
  }
);

export default api;