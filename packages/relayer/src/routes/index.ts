import express from 'express';
import metaTransactionRoutes from './metaTransaction.routes';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import accountRoutes from './account.routes';
import { logger } from '../utils/logger';

const router = express.Router();

// Log all API requests
router.use((req, res, next) => {
  logger.debug(`API Request: ${req.method} ${req.path}`);
  next();
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/meta-tx', metaTransactionRoutes);
router.use('/tx', transactionRoutes);
router.use('/account', accountRoutes);

// Default API info route
router.get('/', (req, res) => {
  res.json({
    service: 'GhostZK Relayer API',
    version: '0.1.0',
    endpoints: {
      '/api/auth': 'Authentication endpoints',
      '/api/meta-tx': 'Meta-transaction endpoints',
      '/api/tx': 'Transaction status endpoints',
      '/api/account': 'Account information endpoints'
    }
  });
});

export default router;