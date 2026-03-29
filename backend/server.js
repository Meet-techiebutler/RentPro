require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { startFlushScheduler, stopFlushScheduler } = require('./src/services/impression.service');
const { initSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  startFlushScheduler();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    await stopFlushScheduler();
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
