// apps/platform/src/lib/api/auth.ts
import { api } from './axios';
import { AuthResponse, LoginCredentials, RefreshTokenRequest } from '@/types';

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  refreshToken: async (request: RefreshTokenRequest) => {
    const { data } = await api.post<AuthResponse>('/auth/refresh', request);
    return data;
  },

  me: async () => {
    const { data } = await api.get<AuthResponse>('/auth/me');
    return data;
  },
};