// lib/api/axios.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { authApi } from './auth';

const REFRESH_THRESHOLD = 5 * 60; // 5 minutes in seconds

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwtDecode(token);
    if (!decoded.exp) return false;
    
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    return expiresIn < REFRESH_THRESHOLD;
  } catch {
    return false;
  }
};

// Request interceptor to add auth token and handle token refresh
api.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return config;
  }

  // Check if token is expiring soon and refresh if needed
  if (isTokenExpiringSoon(accessToken) && !config.url?.includes('/auth/refresh')) {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
          await authApi.refreshToken(refreshToken);
        
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        isRefreshing = false;
        onTokenRefreshed(newAccessToken);
        
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return config;
      }

      // If already refreshing, wait for new token
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(config);
          });
        });
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }

  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest) {
      originalRequest._retry = originalRequest._retry || false;
    }
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        if (!isRefreshing) {
          isRefreshing = true;
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
            await authApi.refreshToken(refreshToken);
          
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          isRefreshing = false;
          onTokenRefreshed(newAccessToken);
          
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        // If already refreshing, wait for new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;