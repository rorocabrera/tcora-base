import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

/**
 * @typedef {Object} AuthState
 * @property {boolean} isAuthenticated
 * @property {Object|null} user
 * @property {boolean} isLoading
 * @property {boolean} isImpersonating
 */

const UserType = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  TENANT_ADMIN: 'TENANT_ADMIN',
  END_USER: 'END_USER',
};


const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Define paths that don't require authentication
const PUBLIC_PATHS = {
  [UserType.PLATFORM_ADMIN]: ['/login'],
  [UserType.TENANT_ADMIN]: ['/admin/login'],
  [UserType.END_USER]: ['/login', '/register', '/forgot-password']
};

/**
 * Creates user profile from JWT payload
 * @param {Object} payload
 * @returns {Object} UserProfile
 */
const createUserProfileFromJWT = (payload) => {
  return {
    id: payload.sub,
    email: payload.email,
    type: payload.type,
    role: payload.role,
    tenantId: payload.tenantId,
    resellerId: payload.resellerId,
    permissions: [],
    isActive: true,
    lastLogin: new Date()
  };
};

const isPublicPath = (path, type) => {
  // Also consider root path as public
  if (path === '/') return true;
  return PUBLIC_PATHS[type].some(publicPath => path === publicPath);
};

/**
 * Creates token pair from JWT
 * @param {string} token
 * @returns {Object} TokenPair
 */
const createTokenPair = (token) => {
  const decoded = jwtDecode(token);
  const expiresIn = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 3600;
  
  return {
    accessToken: token,
    refreshToken: '',
    expiresIn
  };
};

export function AuthProvider({ children, userType = UserType.PLATFORM_ADMIN }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    isImpersonating: false
  });

  const setAuthState = (accessToken) => {
    try {
      const decodedToken = jwtDecode(accessToken);
      const user = createUserProfileFromJWT(decodedToken);
      const tokens = createTokenPair(accessToken);
      
      localStorage.setItem('accessToken', tokens.accessToken);
      // Handle refresh token if/when implemented
      
      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        isImpersonating: !!decodedToken.impersonating
      });
    } catch (error) {
      console.error('Error setting auth state:', error);
      throw new Error('Invalid token format');
    }
  };
  const checkAuth = useCallback(async () => {
    // Skip auth check for public paths and root path
    if (isPublicPath(location.pathname, userType)) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token');
      }

      const decodedToken = jwtDecode(token);
      
      if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      if (decodedToken.type !== userType) {
        throw new Error('Invalid user type for this application');
      }

      setAuthState(token);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isImpersonating: false
      });

      // Only redirect if not on a public path
      if (!isPublicPath(location.pathname, userType)) {
        const loginPath = '/login'; // Simplified login path
        navigate(loginPath, { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    }
  }, [navigate, location.pathname, userType]);
  
  
  useEffect(() => {
    // Only run checkAuth if we're not already checking and not on a public path
    const runAuthCheck = async () => {
      await checkAuth();
    };
    runAuthCheck();
  }, [checkAuth]);

  const platformLogin = async (credentials) => {
    try {
      const response = await authApi.platformLogin(credentials);
      // Handle the JWT token response
      setAuthState(response.accessToken);
      // Navigate to the previous route or dashboard
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Platform login failed:', error);
      throw error;
    }
  };

  const tenantAdminLogin = async (credentials, tenantId) => {
    const response = await authApi.tenantAdminLogin(credentials, tenantId);
    setAuthState(response);
    const from = location.state?.from || '/admin/dashboard';
    navigate(from, { replace: true });
  };

  const endUserLogin = async (credentials, domain) => {
    const response = await authApi.endUserLogin(credentials, domain);
    setAuthState(response);
    const from = location.state?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  const logout = async () => {
    try {
      if (state.user) {
        await authApi.logout();
      }
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        isImpersonating: false
      });

      const loginPath = userType === UserType.PLATFORM_ADMIN ? '/platform/login' 
                     : userType === UserType.TENANT_ADMIN ? '/admin/login'
                     : '/login';
      
      navigate(loginPath, { replace: true });
    }
  };

  const impersonateUser = async (userId, targetType) => {
    if (!state.user || state.user.type !== UserType.PLATFORM_ADMIN) {
      throw new Error('Only platform admins can impersonate users');
    }

    const response = await authApi.impersonate(userId, targetType);
    setAuthState(response);

    const dashboardPath = targetType === UserType.TENANT_ADMIN 
      ? '/admin/dashboard'
      : '/dashboard';
    
    navigate(dashboardPath, { replace: true });
  };

  const stopImpersonation = async () => {
    const response = await authApi.stopImpersonation();
    setAuthState(response);
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