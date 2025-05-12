import express from 'express';
import { aleoService, MetaTransactionRequest } from '../services/aleoService';
import { authenticate, metaTxRateLimiter } from '../middleware/auth';
import { asyncHandler, badRequestError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @route POST /api/meta-tx/submit
 * @description Submit a meta-transaction (gasless transaction)
 * @access Private (requires authentication)
 */
router.post('/submit', authenticate, metaTxRateLimiter, asyncHandler(async (req, res) => {
  const { programId, functionName, inputs, signature } = req.body;
  
  // Validate required fields
  if (!programId || !functionName || !inputs || !signature) {
    throw badRequestError('Missing required fields: programId, functionName, inputs, and signature are required');
  }
  
  // Validate inputs is an array
  if (!Array.isArray(inputs)) {
    throw badRequestError('Inputs must be an array');
  }
  
  // Create meta-transaction request
  const metaTxRequest: MetaTransactionRequest = {
    programId,
    functionName,
    inputs,
    signature,
    senderAddress: req.user!.address
  };
  
  // Log the request
  logger.info(`Meta-transaction request received from ${req.user!.address} for ${programId}.${functionName}`);
  
  // Check if relayer has sufficient balance
  const hasSufficientBalance = await aleoService.hasSufficientBalance();
  if (!hasSufficientBalance) {
    throw badRequestError('Relayer service temporarily unavailable: insufficient balance');
  }
  
  // Submit the meta-transaction
  const response = await aleoService.submitMetaTransaction(metaTxRequest);
  
  // Return the transaction response
  res.status(202).json({
    message: 'Meta-transaction submitted successfully',
    transaction: response
  });
}));

/**
 * @route GET /api/meta-tx/estimate-fee
 * @description Estimate the fee for a meta-transaction
 * @access Private (requires authentication)
 */
router.get('/estimate-fee', authenticate, asyncHandler(async (req, res) => {
  const { programId, functionName, inputs } = req.query;
  
  // Validate required fields
  if (!programId || !functionName || !inputs) {
    throw badRequestError('Missing required fields: programId, functionName, and inputs are required');
  }
  
  // Parse inputs as JSON array if it's a string
  let parsedInputs: string[];
  try {
    parsedInputs = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
    if (!Array.isArray(parsedInputs)) {
      throw new Error('Inputs must be an array');
    }
  } catch (error) {
    throw badRequestError(`Invalid inputs format: ${(error as Error).message}`);
  }
  
  // Create a mock meta-transaction request for fee estimation
  const mockRequest: MetaTransactionRequest = {
    programId: programId as string,
    functionName: functionName as string,
    inputs: parsedInputs,
    signature: 'mock_signature_for_estimation',
    senderAddress: req.user!.address
  };
  
  // Calculate the fee
  const estimatedFee = aleoService['calculateFee'](mockRequest);
  
  // Return the estimated fee
  res.json({
    estimatedFee,
    currency: 'microcredits',
    maxSubsidy: parseInt(process.env.MAX_GAS_SUBSIDY || '1000000')
  });
}));

/**
 * @route GET /api/meta-tx/limits
 * @description Get current rate limits and usage for meta-transactions
 * @access Private (requires authentication)
 */
router.get('/limits', authenticate, asyncHandler(async (req, res) => {
  // In a real implementation, this would query a database to get user's usage
  // For now, we'll return the configured limits
  res.json({
    dailyLimit: parseInt(process.env.DAILY_USER_SUBSIDY_LIMIT || '10'),
    currentUsage: 0, // This would be fetched from a database in production
    resetTime: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
    relayerAddress: aleoService.getRelayerAddress()
  });
}));

/**
 * @route GET /api/meta-tx/relayer
 * @description Get information about the relayer
 * @access Public
 */
router.get('/relayer', asyncHandler(async (req, res) => {
  res.json({
    address: aleoService.getRelayerAddress(),
    network: process.env.ALEO_NETWORK || 'testnet',
    status: await aleoService.hasSufficientBalance() ? 'operational' : 'limited',
    supportedPrograms: [
      // List of supported programs would be fetched from config in production
      'ghostzk_token.aleo',
      'ghostzk_bridge.aleo'
    ]
  });
}));

export default router;