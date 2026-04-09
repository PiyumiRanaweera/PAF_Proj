import axiosInstance from './axiosInstance';

const BASE = '/api/resources';

export const resourceApi = {
  /** Get all resources with optional filters */
  getResources: (params = {}) => axiosInstance.get(BASE, { params }),

  /** Get a single resource by ID */
  getResourceById: (id) => axiosInstance.get(`${BASE}/${id}`),

  /** Create a new resource (Admin) */
  addResource: (data) => axiosInstance.post(BASE, data),

  /** Update an existing resource (Admin) */
  updateResource: (id, data) => axiosInstance.put(`${BASE}/${id}`, data),

  /** Delete a resource (Admin) */
  deleteResource: (id) => axiosInstance.delete(`${BASE}/${id}`),
};
