import api from './axios';

export const brokerApi = {
  getDashboard: () => api.get('/broker/dashboard'),
  getMyProperties: (params) => api.get('/broker/properties', { params }),
  getInquiries: (params) => api.get('/broker/inquiries', { params }),
  updateInquiryStatus: (id, status) => api.patch(`/broker/inquiries/${id}/status`, { status }),
};
