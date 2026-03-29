import api from './axios';

export const propertyApi = {
  getAll: (params) => api.get('/properties', { params }),
  getFeatured: () => api.get('/properties/featured'),
  getNearby: (params) => api.get('/properties/nearby', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (formData) => api.post('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.patch(`/properties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/properties/${id}`),
  deleteImage: (id, publicId) => api.delete(`/properties/${id}/images/${encodeURIComponent(publicId)}`),
  submitInquiry: (id, data) => api.post(`/properties/${id}/inquiries`, data),
};
