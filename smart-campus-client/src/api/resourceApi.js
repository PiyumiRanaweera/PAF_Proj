import axiosInstance from './axiosInstance';

export const resourceApi = {
  // GET /api/resources/metadata
  getMetadata: () => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: {
          types: ['LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'],
          statuses: ['ACTIVE', 'OUT_OF_SERVICE'],
        },
      });
    }
    return axiosInstance.get('/api/resources/metadata');
  },

  // GET /api/resources
  getAll: (params = {}) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      const mockData = [
        {
          id: 1,
          name: 'A401 Lecture Hall',
          type: 'LECTURE_HALL',
          capacity: 120,
          location: 'Main Building - Floor 4',
          availableFrom: '08:00:00',
          availableTo: '18:00:00',
          status: 'ACTIVE',
          description: 'Projector and audio system included.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Network Lab 02',
          type: 'LAB',
          capacity: 35,
          location: 'Engineering Block - Floor 2',
          availableFrom: '09:00:00',
          availableTo: '17:00:00',
          status: 'OUT_OF_SERVICE',
          description: 'Temporary maintenance due to switch replacement.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      let filtered = [...mockData];
      if (params.type) filtered = filtered.filter((r) => r.type === params.type);
      if (params.status) filtered = filtered.filter((r) => r.status === params.status);
      if (params.name) {
        const nameQuery = params.name.toLowerCase();
        filtered = filtered.filter((r) => r.name.toLowerCase().includes(nameQuery));
      }
      if (params.location) {
        const q = params.location.toLowerCase();
        filtered = filtered.filter((r) => r.location.toLowerCase().includes(q));
      }
      if (params.minCapacity) {
        filtered = filtered.filter((r) => r.capacity >= Number(params.minCapacity));
      }

      return Promise.resolve({ data: filtered });
    }

    return axiosInstance.get('/api/resources', { params });
  },

  // GET /api/resources/{id}
  getById: (id) => axiosInstance.get(`/api/resources/${id}`),

  // POST /api/resources
  create: (payload) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: {
          id: Date.now(),
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return axiosInstance.post('/api/resources', payload);
  },

  // PUT /api/resources/{id}
  update: (id, payload) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: {
          id,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return axiosInstance.put(`/api/resources/${id}`, payload);
  },

  // PATCH /api/resources/{id}/status
  updateStatus: (id, status) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') {
      return Promise.resolve({
        data: {
          id,
          status,
          updatedAt: new Date().toISOString(),
        },
      });
    }
    return axiosInstance.patch(`/api/resources/${id}/status`, { status });
  },

  // DELETE /api/resources/{id}
  delete: (id) => {
    if (localStorage.getItem('accessToken') === 'mock_token_123') return Promise.resolve();
    return axiosInstance.delete(`/api/resources/${id}`);
  },
};
