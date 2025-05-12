import express from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, generateToken, verifyToken } from '../middleware/auth';
import { asyncHandler, unauthorizedError, badRequestError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @route POST /api/auth/login
 * @description Authenticate a user with address and signed message
 * @access Public
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { address, signature, message } = req.body;
  
  // Validate required fields
  if (!address || !signature || !message) {
    throw badRequestError('Address, signature, and message are required');
  }
  
  // In a real implementation, we would:
  // 1. Verify that the message was signed by the private key corresponding to the address
  // 2. Check if the user exists in our database
  // 3. Create a session or JWT for the user
  
  // For now, simulate successful authentication
  logger.info(`User authenticated: ${address}`);
  
  // Create a token for the user with a 24-hour expiry
  const token = generateToken({
    id: `user_${Date.now()}`, // In production, this would be a real user ID
    address,
    roles: ['user'] // Default role
  });
  
  res.json({
    token,
    user: {
      address,
      roles: ['user']
    }
  });
}));

/**
 * @route POST /api/auth/verify
 * @description Verify a JWT token
 * @access Public
 */
router.post('/verify', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw badRequestError('Token is required');
  }
  
  try {
    // Verify the token
    const decoded = verifyToken(token);
    
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        address: decoded.address,
        roles: decoded.roles || []
      }
    });
  } catch (error) {
    res.json({
      valid: false,
      error: (error as Error).message
    });
  }
}));

/**
 * @route POST /api/auth/refresh
 * @description Refresh a JWT token
 * @access Private (requires valid but potentially expired token)
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    throw badRequestError('Token is required');
  }
  
  try {
    // Verify the token with ignoreExpiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production', {
      ignoreExpiration: true
    }) as any;
    
    // Check if token is too old to refresh (e.g., >7 days)
    const issuedAt = new Date(decoded.iat * 1000);
    const now = new Date();
    const tokenAge = now.getTime() - issuedAt.getTime();
    const maxRefreshAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (tokenAge > maxRefreshAge) {
      throw unauthorizedError('Token too old to refresh');
    }
    
    // Generate a new token
    const newToken = generateToken({
      id: decoded.id,
      address: decoded.address,
      roles: decoded.roles || []
    });
    
    res.json({
      token: newToken,
      user: {
        id: decoded.id,
        address: decoded.address,
        roles: decoded.roles || []
      }
    });
  } catch (error) {
    throw unauthorizedError(`Failed to refresh token: ${(error as Error).message}`);
  }
}));

/**
 * @route GET /api/auth/me
 * @description Get current user information
 * @access Private (requires authentication)
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  // The user information is attached to the request by the authenticate middleware
  res.json({
    user: {
      id: req.user!.id,
      address: req.user!.address,
      roles: req.user!.roles || []
    }
  });
}));

/**
 * @route POST /api/auth/challenge
 * @description Get a challenge message for authentication
 * @access Public
 */
router.post('/challenge', asyncHandler(async (req, res) => {
  const { address } = req.body;
  
  if (!address) {
    throw badRequestError('Address is required');
  }
  
  // Generate a random challenge nonce
  const nonce = Math.floor(Math.random() * 1000000).toString();
  const timestamp = Date.now();
  
  // Create a challenge message to be signed by the wallet
  const message = `Sign this message to authenticate with GhostZK Relayer: ${nonce} (${timestamp})`;
  
  // In a real implementation, we would store this challenge in a database
  // with an expiry time to prevent replay attacks
  
  res.json({
    message,
    nonce,
    timestamp,
    expiresIn: 300 // 5 minutes in seconds
  });
}));

export default router;