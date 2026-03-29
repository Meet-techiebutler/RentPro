import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useSocketStore from '../store/socketStore';

export default function SocketProvider({ children }) {
  const { user, token } = useAuthStore();
  const { connect, disconnect, socket } = useSocketStore();
  const queryClient = useQueryClient();

  // Connect / disconnect based on auth state
  useEffect(() => {
    try {
      if (token && user) connect(token);
      else disconnect();
    } catch { /* socket unavailable — continue without real-time */ }
    return () => {};
  }, [token, user]);

  // Listen for new-inquiry events once socket is available
  useEffect(() => {
    if (!socket) return;

    const handleNewInquiry = (inq) => {
      // Invalidate all relevant cached queries so counts + lists refresh instantly
      queryClient.invalidateQueries({ queryKey: ['broker-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['broker-new-inquiry-count'] });
      queryClient.invalidateQueries({ queryKey: ['broker-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });

      // Toast notification
      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex gap-3 p-4 border border-primary-100`}
          >
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">New Inquiry!</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                <span className="font-medium text-gray-700">{inq.name}</span>
                {inq.property?.title ? ` › ${inq.property.title}` : ''}
              </p>
              {inq.message && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{inq.message}</p>
              )}
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    };

    socket.on('inquiry:new', handleNewInquiry);
    return () => socket.off('inquiry:new', handleNewInquiry);
  }, [socket, queryClient]);

  return children;
}
