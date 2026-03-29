import api from './axios';

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getBrokers: (params) => api.get('/admin/brokers', { params }),
  getBroker: (id) => api.get(`/admin/brokers/${id}`),
  createBroker: (data) => api.post('/admin/brokers', data),
  updateBroker: (id, data) => api.patch(`/admin/brokers/${id}`, data),
  deleteBroker: (id) => api.delete(`/admin/brokers/${id}`),
  getAllInquiries: (params) => api.get('/admin/inquiries', { params }),
};
