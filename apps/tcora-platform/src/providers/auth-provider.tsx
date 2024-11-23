// src/providers/auth-provider.tsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { UserProfile, LoginCredentials } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token');
      }

      const { user } = await authApi.me();
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });

      // If on a public route, redirect to dashboard
      if (PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/dashboard');
      }
    } catch (error) {
      // Clear any invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

      // Only redirect to login if not on a public route
      if (!PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    const { accessToken, refreshToken, user } = await authApi.login(credentials);
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    setState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });

    // Navigate to the previous route or dashboard
    const from = location.state?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

