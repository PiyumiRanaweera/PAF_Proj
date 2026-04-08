import axiosInstance from './axiosInstance';

const BASE = '/api/bookings';
const ADMIN_BASE = '/api/admin/bookings';

/* ─── User endpoints ─────────────────────────────────────────────── */

export const bookingApi = {
  /** Create a new booking request */
  createBooking: (data) => axiosInstance.post(BASE, data),

  /** Get current user's bookings (with optional filters) */
  getMyBookings: (params = {}) => axiosInstance.get(`${BASE}/my`, { params }),

  /** Get any booking by ID */
  getBookingById: (id) => axiosInstance.get(`${BASE}/${id}`),

  /** Cancel a booking (user or admin) */
  cancelBooking: (id, reason) =>
    axiosInstance.patch(`${BASE}/${id}/cancel`, { cancellationReason: reason }),

  /** Check for conflicts before creating */
  checkConflict: (params) =>
    axiosInstance.get(`${BASE}/check-conflict`, { params }),
};

/* ─── Admin endpoints ────────────────────────────────────────────── */

export const adminBookingApi = {
  /** Get all bookings with filters */
  getAllBookings: (params = {}) => axiosInstance.get(ADMIN_BASE, { params }),

  /** Approve a pending booking */
  approveBooking: (id) => axiosInstance.patch(`${ADMIN_BASE}/${id}/approve`),

  /** Reject a pending booking with reason */
  rejectBooking: (id, reason) =>
    axiosInstance.patch(`${ADMIN_BASE}/${id}/reject`, { rejectionReason: reason }),

  /** Admin cancel */
  adminCancelBooking: (id, reason) =>
    axiosInstance.patch(`${ADMIN_BASE}/${id}/cancel`, { cancellationReason: reason }),
};
