import axiosInstance from './axiosInstance';

export const notificationApi = {
  // GET /api/notifications
  getAll: () => axiosInstance.get('/api/notifications'),

  // GET /api/notifications/unread
  getUnread: () => axiosInstance.get('/api/notifications/unread'),

  // GET /api/notifications/count
  getUnreadCount: () => axiosInstance.get('/api/notifications/count'),

  // PATCH /api/notifications/{id}/read
  markAsRead: (id) => axiosInstance.patch(`/api/notifications/${id}/read`),

  // PATCH /api/notifications/read-all
  markAllAsRead: () => axiosInstance.patch('/api/notifications/read-all'),

  // DELETE /api/notifications/{id}
  delete: (id) => axiosInstance.delete(`/api/notifications/${id}`),
};
