import axiosInstance from './axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const authApi = {
  // Redirect to Google OAuth2
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorize/google`;
  },

  // Get current user profile after OAuth2 redirect
  getCurrentUser: () => axiosInstance.get('/api/auth/me'),

  // Check auth service status
  getAuthStatus: () => axiosInstance.get('/api/auth/status'),
};
