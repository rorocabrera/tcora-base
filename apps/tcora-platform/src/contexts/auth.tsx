// apps/platform/src/contexts/auth.tsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { UserProfile, LoginCredentials } from '@tcora/config';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Export the context as a named export
export const AuthContext = createContext<AuthContextType | undefined>(undefined);


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

      if (PUBLIC_ROUTES.includes(location.pathname)) {
        navigate('/dashboard');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });

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
    const { tokens,user } = await authApi.platformLogin(credentials);
    
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    
    setState({
      isAuthenticated: true,
      user,
      isLoading: false,
    });

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