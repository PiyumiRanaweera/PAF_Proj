import axiosInstance from './axiosInstance';

export const userApi = {
  // GET /api/users/me
  getMyProfile: () => axiosInstance.get('/api/users/me'),

  // PATCH /api/users/me/notifications
  updateNotificationPreferences: (prefs) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...user, ...prefs };
      return Promise.resolve({ data: updatedUser });
    }
    return axiosInstance.patch('/api/users/me/notifications', prefs);
  },

  // GET /api/users  (Admin)
  getAllUsers: () => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: [
          { id: 1, name: 'Test Setup', email: 'test@smartcampus.edu', oauthProvider: 'google', roles: ['USER', 'ADMIN', 'MANAGER'], isActive: true, createdAt: new Date().toISOString() },
          { id: 2, name: 'Alice Smith', email: 'alice@smartcampus.edu', oauthProvider: 'google', roles: ['USER'], isActive: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, name: 'Bob Technician', email: 'bob@smartcampus.edu', oauthProvider: 'google', roles: ['USER', 'TECHNICIAN'], isActive: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
        ]
      });
    }
    return axiosInstance.get('/api/users');
  },

  // GET /api/users/:id  (Admin)
  getUserById: (id) => axiosInstance.get(`/api/users/${id}`),

  // PUT /api/users/:id/role  (Admin)
  updateUserRole: (id, payload) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: { id, name: 'Mocked User', email: 'user@smartcampus.edu', oauthProvider: 'google', roles: payload.action === 'ADD' ? ['USER', payload.role] : ['USER'], isActive: true, createdAt: new Date().toISOString() }
      });
    }
    return axiosInstance.put(`/api/users/${id}/role`, payload);
  },

  // DELETE /api/users/:id  (Admin)
  deactivateUser: (id) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') return Promise.resolve();
    return axiosInstance.delete(`/api/users/${id}`);
  },
};
