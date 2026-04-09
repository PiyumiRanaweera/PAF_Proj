/**
 * User API Module
 * 
 * Handles all user-related API requests including profile retrieval,
 * notification preferences, and admin user management.
 */

import axiosInstance from './axiosInstance';

/**
 * Mock data for testing without backend
 */
const MOCK_USERS = [
  {
    id: 1,
    name: 'Test Setup',
    email: 'test@smartcampus.edu',
    oauthProvider: 'google',
    roles: ['USER', 'ADMIN', 'MANAGER'],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Alice Smith',
    email: 'alice@smartcampus.edu',
    oauthProvider: 'google',
    roles: ['USER'],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    name: 'Bob Technician',
    email: 'bob@smartcampus.edu',
    oauthProvider: 'google',
    roles: ['USER', 'TECHNICIAN'],
    isActive: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

/**
 * Check if using mock authentication
 * @returns {boolean} true if using mock token
 */
const isMockMode = () => localStorage.getItem('accessToken') === 'mock_token_123';

export const userApi = {
  /**
   * Retrieve the current authenticated user's profile
   * 
   * GET /api/users/me
   * 
   * @returns {Promise} Response containing UserDTO
   * @throws {Error} If the request fails
   */
  getMyProfile: () => axiosInstance.get('/api/users/me'),

  /**
   * Update the current user's notification preferences
   * 
   * PATCH /api/users/me/notifications
   * 
   * @param {Object} prefs - Notification preferences object
   * @param {boolean} [prefs.notificationBookingEnabled] - Enable booking notifications
   * @param {boolean} [prefs.notificationTicketEnabled] - Enable ticket notifications
   * @param {boolean} [prefs.notificationCommentEnabled] - Enable comment notifications
   * @param {boolean} [prefs.notificationEmailEnabled] - Enable email notifications
   * @returns {Promise} Response containing updated UserDTO
   * @throws {Error} If validation fails or user not found
   */
  updateNotificationPreferences: (prefs) => {
    if (isMockMode()) {
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...prefs };
      return Promise.resolve({ data: updatedUser });
    }
    return axiosInstance.patch('/api/users/me/notifications', prefs);
  },

  /**
   * Retrieve all users (Admin only)
   * 
   * GET /api/users
   * 
   * @returns {Promise} Response containing array of UserDTOs
   * @throws {Error} If unauthorized or request fails
   */
  getAllUsers: () => {
    if (isMockMode()) {
      return Promise.resolve({ data: MOCK_USERS });
    }
    return axiosInstance.get('/api/users');
  },

  /**
   * Retrieve a specific user by ID (Admin only)
   * 
   * GET /api/users/:id
   * 
   * @param {number} id - User's unique identifier
   * @returns {Promise} Response containing UserDTO
   * @throws {Error} If user not found or unauthorized
   */
  getUserById: (id) => axiosInstance.get(`/api/users/${id}`),

  /**
   * Update a user's role (Admin only)
   * 
   * PUT /api/users/:id/role
   * 
   * @param {number} id - User's unique identifier
   * @param {Object} payload - Role assignment request
   * @param {string} payload.role - Role to assign/remove (e.g., 'ADMIN', 'MANAGER')
   * @param {string} payload.action - Action to perform ('ADD' or 'REMOVE')
   * @returns {Promise} Response containing updated UserDTO
   * @throws {Error} If validation fails or user cannot be updated
   */
  updateUserRole: (id, payload) => {
    if (isMockMode()) {
      return Promise.resolve({
        data: {
          id,
          name: 'Mocked User',
          email: 'user@smartcampus.edu',
          oauthProvider: 'google',
          roles: payload.action === 'ADD' ? ['USER', payload.role] : ['USER'],
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      });
    }
    return axiosInstance.put(`/api/users/${id}/role`, payload);
  },

  /**
   * Deactivate a user account (Admin only)
   * 
   * DELETE /api/users/:id
   * 
   * Note: This soft-deletes the account, marking it as inactive.
   * User data is preserved in the database.
   * 
   * @param {number} id - User's unique identifier
   * @returns {Promise} Response with no content (204)
   * @throws {Error} If user not found or unauthorized
   */
  deactivateUser: (id) => {
    if (isMockMode()) return Promise.resolve();
    return axiosInstance.delete(`/api/users/${id}`);
  },
};
