// apps/platform/src/providers/auth-provider.tsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { 
  UserProfile, 
  LoginCredentials, 
  TokenPair,
  UserType,
  JWTPayload
} from '@tcora/config';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  isImpersonating: boolean;
}

interface AuthContextType extends AuthState {
  platformLogin: (credentials: Omit<LoginCredentials, 'context'>) => Promise<void>;
  tenantAdminLogin: (credentials: Omit<LoginCredentials, 'context'>, tenantId: string) => Promise<void>;
  endUserLogin: (credentials: Omit<LoginCredentials, 'context'>, domain: string) => Promise<void>;
  logout: () => Promise<void>;
  impersonateUser: (userId: string, userType: UserType) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define paths that don't require authentication
const PUBLIC_PATHS = {
  [UserType.PLATFORM_ADMIN]: ['/platform/login'],
  [UserType.TENANT_ADMIN]: ['/admin/login'],
  [UserType.END_USER]: ['/login', '/register', '/forgot-password']
};

export function AuthProvider({ 
  children,
  userType = UserType.PLATFORM_ADMIN // Default to platform admin for the platform app
}: { 
  children: React.ReactNode;
  userType?: UserType;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    isImpersonating: false
  });

  const setAuthState = (tokens: TokenPair, user: UserProfile) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    
    setState({
      isAuthenticated: true,
      user,
      isLoading: false,
      isImpersonating: !!jwtDecode<JWTPayload>(tokens.accessToken).impersonating
    });
  };

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token');
      }
  
      const { user } = await authApi.me();
      
      if (user.type !== userType) {
        throw new Error('Invalid user type for this application');
      }
  
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        isImpersonating: !!jwtDecode<JWTPayload>(token).impersonating
      });
  
      // Only redirect if we're on the login page
      if (location.pathname === '/login') {
        navigate('/dashboard');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isImpersonating: false
      });
  
      // Only redirect to login if not already there
      if (!PUBLIC_PATHS[userType].includes(location.pathname)) {
        const loginPath = userType === UserType.PLATFORM_ADMIN ? '/login' 
                       : userType === UserType.TENANT_ADMIN ? '/admin/login'
                       : '/login';
        
        navigate(loginPath, { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    }
  }, [navigate, userType]); 

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const platformLogin = async (credentials: Omit<LoginCredentials, 'context'>) => {
    const response = await authApi.platformLogin(credentials);
    setAuthState(response.tokens, response.user);

    // Navigate to the previous route or dashboard
    const from = (location.state as any)?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  const tenantAdminLogin = async (
    credentials: Omit<LoginCredentials, 'context'>,
    tenantId: string
  ) => {
    const response = await authApi.tenantAdminLogin(credentials, tenantId);
    setAuthState(response.tokens, response.user);

    // Navigate to tenant admin dashboard
    const from = (location.state as any)?.from || '/admin/dashboard';
    navigate(from, { replace: true });
  };

  const endUserLogin = async (
    credentials: Omit<LoginCredentials, 'context'>,
    domain: string
  ) => {
    const response = await authApi.endUserLogin(credentials, domain);
    setAuthState(response.tokens, response.user);

    // Navigate to user dashboard
    const from = (location.state as any)?.from || '/dashboard';
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
        isImpersonating: false
      });

      // Redirect to appropriate login page based on user type
      const loginPath = userType === UserType.PLATFORM_ADMIN ? '/platform/login' 
                     : userType === UserType.TENANT_ADMIN ? '/admin/login'
                     : '/login';
      
      navigate(loginPath, { replace: true });
    }
  };

  const impersonateUser = async (userId: string, targetType: UserType) => {
    if (!state.user || state.user.type !== UserType.PLATFORM_ADMIN) {
      throw new Error('Only platform admins can impersonate users');
    }

    const response = await authApi.impersonate(userId, targetType);
    setAuthState(response.tokens, response.user);

    // Redirect to appropriate dashboard based on impersonated user type
    const dashboardPath = targetType === UserType.TENANT_ADMIN 
      ? '/admin/dashboard'
      : '/dashboard';
    
    navigate(dashboardPath, { replace: true });
  };

  const stopImpersonation = async () => {
    const response = await authApi.stopImpersonation();
    setAuthState(response.tokens, response.user);
    
    // Return to platform admin dashboard
    navigate('/platform/dashboard', { replace: true });
  };

  return (
    <AuthContext.Provider 
      value={{
        ...state,
        platformLogin,
        tenantAdminLogin,
        endUserLogin,
        logout,
        impersonateUser,
        stopImpersonation
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}