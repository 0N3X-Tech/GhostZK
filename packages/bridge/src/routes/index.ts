import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getBridgeService } from '../services/bridgeService';
import { logger } from '../utils/logger';

const router = express.Router();
const bridgeService = getBridgeService();

// Log all API requests
router.use((req, res, next) => {
  logger.debug(`Bridge API Request: ${req.method} ${req.path}`);
  next();
});

// Get bridge status
router.get('/status', asyncHandler(async (req, res) => {
  const status = bridgeService.getStatus();
  res.json({ status });
}));

// Get all transactions
router.get('/transactions', asyncHandler(async (req, res) => {
  const transactions = bridgeService.getAllTransactions();
  res.json({ transactions });
}));

// Get pending transactions
router.get('/transactions/pending', asyncHandler(async (req, res) => {
  const transactions = bridgeService.getPendingTransactions();
  res.json({ transactions });
}));

// Get transaction by ID
router.get('/transactions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transaction = bridgeService.getTransaction(id);
  
  if (!transaction) {
    return res.status(404).json({
      status: 'error',
      message: 'Transaction not found'
    });
  }
  
  res.json({ transaction });
}));

// Initiate ETH -> Aleo transfer
router.post('/transfer/eth-to-aleo', asyncHandler(async (req, res) => {
  const { ethereumSender, aleoRecipient, amount } = req.body;
  
  if (!ethereumSender || !aleoRecipient || !amount) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required parameters: ethereumSender, aleoRecipient, amount'
    });
  }
  
  const transaction = await bridgeService.transferEthereumToAleo(
    ethereumSender,
    aleoRecipient,
    amount
  );
  
  res.status(201).json({
    status: 'success',
    message: 'Transfer initiated',
    transaction
  });
}));

// Initiate Aleo -> ETH transfer
router.post('/transfer/aleo-to-eth', asyncHandler(async (req, res) => {
  const { aleoSender, ethereumRecipient, amount } = req.body;
  
  if (!aleoSender || !ethereumRecipient || !amount) {
    return res.status(400).json({
      status: 'error',
      message: 'Missing required parameters: aleoSender, ethereumRecipient, amount'
    });
  }
  
  const transaction = await bridgeService.transferAleoToEthereum(
    aleoSender,
    ethereumRecipient,
    amount
  );
  
  res.status(201).json({
    status: 'success',
    message: 'Transfer initiated',
    transaction
  });
}));

// Pause bridge
router.post('/admin/pause', asyncHandler(async (req, res) => {
  // In production, this would have authentication
  await bridgeService.pauseBridge();
  
  res.json({
    status: 'success',
    message: 'Bridge operations paused',
    currentStatus: bridgeService.getStatus().operationalStatus
  });
}));

// Unpause bridge
router.post('/admin/unpause', asyncHandler(async (req, res) => {
  // In production, this would have authentication
  await bridgeService.unpauseBridge();
  
  res.json({
    status: 'success',
    message: 'Bridge operations resumed',
    currentStatus: bridgeService.getStatus().operationalStatus
  });
}));

// Default API info route
router.get('/', (req, res) => {
  res.json({
    service: 'GhostZK Bridge API',
    version: '0.1.0',
    endpoints: {
      '/api/status': 'Bridge operational status',
      '/api/transactions': 'List all transactions',
      '/api/transactions/pending': 'List pending transactions',
      '/api/transactions/:id': 'Get transaction by ID',
      '/api/transfer/eth-to-aleo': 'Initiate Ethereum to Aleo transfer',
      '/api/transfer/aleo-to-eth': 'Initiate Aleo to Ethereum transfer',
      '/api/admin/pause': 'Pause bridge operations',
      '/api/admin/unpause': 'Resume bridge operations'
    }
  });
});

export default router;