/**
 * Auth Context Module
 * 
 * Provides global authentication state management for the entire application.
 * Handles user login, logout, role-based access, and session persistence.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * 
 * Wraps the application to provide authentication context to all child components.
 * Manages user session, authentication state, and role-based access control.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Components to wrap
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Restore user session from localStorage on app load
   * Persists authentication across page refreshes
   */
  useEffect(() => {
    const restoreSession = () => {
      try {
        const token = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('Failed to restore session:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /**
   * Login using an access token (from OAuth2 or API)
   * 
   * Stores token, fetches user profile, and updates auth state.
   * Called after successful OAuth2 redirect or admin login.
   * 
   * @param {string} token - JWT access token
   * @returns {Promise<Object>} User data
   */
  const loginWithToken = useCallback(async (token) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      localStorage.setItem('accessToken', token);

      // Fetch user profile with new token
      const res = await authApi.getCurrentUser();
      const userData = res.data;

      // Store user and update state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return userData;
    } catch (err) {
      // Clean up on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      
      const errorMsg = err.response?.data?.message || 'Failed to authenticate';
      setAuthError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout the current user
   * 
   * Clears authentication token and user data from storage and state.
   * Optionally notifies backend to invalidate session.
   */
  const logout = useCallback(() => {
    // Notify backend to invalidate session (best effort)
    authApi.logout().catch(err => console.warn('Logout notification failed:', err));

    // Clear local state and storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setAuthError(null);
  }, []);

  /**
   * Mock login for development/testing
   * 
   * Creates a mock user and token for testing without backend.
   * Should only be used in development mode.
   * 
   * @param {boolean} isAdminAccess - Whether to login as admin (true) or user (false)
   */
  const mockLogin = useCallback((isAdminAccess = false) => {
    const mockUser = {
      id: isAdminAccess ? 999 : 1,
      name: isAdminAccess ? 'Admin User' : 'Test Student',
      email: isAdminAccess ? 'admin@smartcampus.edu' : 'student@smartcampus.edu',
      roles: isAdminAccess ? ['ADMIN', 'MANAGER', 'USER'] : ['USER'],
      oauthProvider: 'mock',
      notificationBookingEnabled: true,
      notificationTicketEnabled: true,
      notificationCommentEnabled: true,
      notificationEmailEnabled: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      avatarUrl: null,
    };

    localStorage.setItem('accessToken', isAdminAccess ? 'mock_token_admin_123' : 'mock_token_user_123');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    setAuthError(null);
  }, []);

  /**
   * Check if current user has admin role
   * @returns {boolean} True if user is admin
   */
  const isAdmin = useCallback(() => user?.roles?.includes('ADMIN') ?? false, [user]);

  /**
   * Check if current user has technician role
   * @returns {boolean} True if user is technician
   */
  const isTechnician = useCallback(() => user?.roles?.includes('TECHNICIAN') ?? false, [user]);

  /**
   * Check if current user has manager role
   * @returns {boolean} True if user is manager
   */
  const isManager = useCallback(() => user?.roles?.includes('MANAGER') ?? false, [user]);

  /**
   * Check if current user has a specific role
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = useCallback((role) => user?.roles?.includes(role) ?? false, [user]);

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is logged in
   */
  const isAuthenticated = useCallback(() => !!user && !!localStorage.getItem('accessToken'), [user]);

  const value = {
    // State
    user,
    setUser,
    loading,
    authError,

    // Auth Methods
    loginWithToken,
    logout,
    mockLogin,

    // Role Checks
    isAdmin,
    isTechnician,
    isManager,
    hasRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Hook to access authentication context throughout the application.
 * Must be used within an AuthProvider.
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside AuthProvider
 * 
 * @example
 * const { user, logout, isAdmin } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
