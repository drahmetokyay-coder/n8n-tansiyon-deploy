import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { connectDatabase } from './config/database';
import { initializeSocket } from './services/socketService';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import swipeRoutes from './routes/swipes';
import matchRoutes from './routes/matches';
import notificationRoutes from './routes/notifications';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/swipes', swipeRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Connect to database and start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    server.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║      🚀 JobSwipe API Server              ║
║                                          ║
║      Port: ${PORT}                        ║
║      Environment: ${process.env.NODE_ENV || 'development'}              ║
║      Socket.io: Enabled                  ║
║                                          ║
╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
