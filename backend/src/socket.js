const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: false,
    },
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name email role isActive');
      if (!user || !user.isActive) return next(new Error('User not found or inactive'));

      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { _id, role, name } = socket.user;

    // Each broker joins their personal room; admins join the shared admin room
    if (role === 'broker') {
      socket.join(`broker:${_id}`);
    }
    if (role === 'admin') {
      socket.join('admin');
    }

    console.log(`🔌 Socket connected: ${name} (${role})`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${name}`);
    });
  });

  return io;
};

const getIO = () => io || null;

/**
 * Emit a new-inquiry event to:
 *  - the broker's personal room
 *  - all admin connections
 */
const emitNewInquiry = (brokerId, inquiryPayload) => {
  try {
    if (!io) return;
    io.to(`broker:${brokerId}`).emit('inquiry:new', inquiryPayload);
    io.to('admin').emit('inquiry:new', inquiryPayload);
  } catch (err) {
    console.warn('⚠️  Socket emit skipped:', err.message);
  }
};

module.exports = { initSocket, getIO, emitNewInquiry };
