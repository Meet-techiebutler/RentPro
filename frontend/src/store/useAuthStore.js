import { create } from 'zustand';
import { authApi } from '../api/auth.api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(credentials);
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isLoading: false });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const res = await authApi.getMe();
      const user = res.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      get().logout();
    }
  },

  isAuthenticated: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin',
  isBroker: () => get().user?.role === 'broker',
}));

export default useAuthStore;
