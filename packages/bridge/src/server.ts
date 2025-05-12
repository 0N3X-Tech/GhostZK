import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import routes and middleware
import bridgeRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { setupLogger, logger } from './utils/logger';
import { initializeBridgeService } from './services/bridgeService';

// Setup logger
setupLogger();

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Default: 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiter to all requests
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api', bridgeRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize bridge services
initializeBridgeService().catch(error => {
  logger.error(`Failed to initialize bridge service: ${error.message}`);
  process.exit(1);
});

// Create HTTP server
const server = createServer(app);

// Start server
server.listen(PORT, () => {
  logger.info(`GhostZK Bridge Service running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle server errors
server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default server;