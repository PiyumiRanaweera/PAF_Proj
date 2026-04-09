/**
 * Authentication API Module
 * 
 * Handles all authentication-related API requests including OAuth2 flow
 * and admin/staff login with email and password.
 */

import axiosInstance from './axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';

/**
 * Auth API object containing all authentication methods
 */
export const authApi = {
  /**
   * Redirect to Google OAuth2 authorization endpoint
   * 
   * Initiates the OAuth2 flow for student/user login
   * Uses university Google accounts for secure authentication
   */
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorize/google`;
  },

  /**
   * Admin/Staff login with email and password
   * 
   * POST /api/auth/admin/login
   * 
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - Admin/staff email address
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Response containing accessToken and user data
   * @throws {Error} If login fails (401 Unauthorized, 400 Bad Request, etc.)
   * 
   * @example
   * const response = await authApi.adminLogin({
   *   email: 'admin@smartcampus.edu',
   *   password: 'securePassword123'
   * });
   * // Returns: { accessToken: '...', user: {...}, expiresIn: 3600 }
   */
  adminLogin: (credentials) => {
    return axiosInstance.post('/api/auth/admin/login', credentials);
  },

  /**
   * Get current authenticated user's profile
   * 
   * GET /api/auth/me
   * 
   * Retrieves the full profile of the currently authenticated user.
   * Called after OAuth2 redirect to get user information.
   * 
   * @returns {Promise<Object>} Response containing UserDTO
   * @throws {Error} If user not authenticated or request fails
   */
  getCurrentUser: () => axiosInstance.get('/api/auth/me'),

  /**
   * Check authentication service status
   * 
   * GET /api/auth/status
   * 
   * Verifies that the authentication service is running
   * and returns configuration information.
   * 
   * @returns {Promise<Object>} Service status information
   */
  getAuthStatus: () => axiosInstance.get('/api/auth/status'),

  /**
   * Refresh authentication token
   * 
   * POST /api/auth/refresh
   * 
   * Refreshes the JWT token before it expires.
   * Used to maintain active sessions without re-authentication.
   * 
   * @returns {Promise<Object>} Response containing new accessToken
   * @throws {Error} If token refresh fails
   */
  refreshToken: () => axiosInstance.post('/api/auth/refresh'),

  /**
   * Logout from current session
   * 
   * POST /api/auth/logout
   * 
   * Invalidates the current session token on the backend.
   * Should be called before clearing local storage.
   * 
   * @returns {Promise<Object>} Logout confirmation
   */
  logout: () => axiosInstance.post('/api/auth/logout'),
};
