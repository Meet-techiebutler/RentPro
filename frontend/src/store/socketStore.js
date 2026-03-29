import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,

  connect: (token) => {
    try {
      const existing = get().socket;
      if (existing?.connected) return;

      // Connect via Vite proxy (/socket.io) so it works on both localhost and LAN
      const socket = io(window.location.origin, {
        auth: { token },
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionAttempts: 3,
      });

      socket.on('connect', () => set({ connected: true }));
      socket.on('disconnect', () => set({ connected: false }));
      // Silently swallow all socket errors — app works without real-time
      socket.on('connect_error', () => {});
      socket.on('error', () => {});

      set({ socket });
    } catch {
      // Socket unavailable — app continues without real-time features
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, connected: false });
    }
  },
}));

export default useSocketStore;
