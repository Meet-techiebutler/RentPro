import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/update-profile', data),
  changePassword: (data) => api.patch('/auth/change-password', data),
};
