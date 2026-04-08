import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, restore user from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Called after OAuth2 redirect with token in URL
  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('accessToken', token);
    try {
      const res = await authApi.getCurrentUser();
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    } catch (err) {
      localStorage.removeItem('accessToken');
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const mockLogin = useCallback((isAdminAccess = false) => {
    const mockUser = {
      id: isAdminAccess ? 999 : 1,
      name: isAdminAccess ? 'Admin Access' : 'Test Setup',
      email: isAdminAccess ? 'admin@smartcampus.edu' : 'test@smartcampus.edu',
      roles: isAdminAccess ? ['ADMIN', 'MANAGER', 'USER'] : ['USER'],
      notificationBookingEnabled: true,
      notificationTicketEnabled: true,
      notificationCommentEnabled: true,
    };
    localStorage.setItem('accessToken', 'mock_token_123');
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const isAdmin = () => user?.roles?.includes('ADMIN');
  const isTechnician = () => user?.roles?.includes('TECHNICIAN');
  const isManager = () => user?.roles?.includes('MANAGER');
  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, loginWithToken, logout, mockLogin, isAdmin, isTechnician, isManager, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
