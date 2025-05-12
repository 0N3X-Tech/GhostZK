import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { ApiError, unauthorizedError, forbiddenError } from './errorHandler';
import { logger } from '../utils/logger';
import rateLimit from 'express-rate-limit';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        address: string;
        roles?: string[];
        [key: string]: any;
      };
    }
  }
}

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_replace_in_production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Generate a JWT token for a user
export const generateToken = (
  payload: { id: string; address: string; roles?: string[]; [key: string]: any }
): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(unauthorizedError('Authentication required. Bearer token missing.'));
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(unauthorizedError('Authentication token is missing'));
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      address: decoded.address,
      roles: decoded.roles || []
    };
    
    logger.debug(`User authenticated: ${req.user.address}`);
    
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    
    return next(
      unauthorizedError((error as Error).message || 'Authentication failed')
    );
  }
};

// Role-based authorization middleware
export const authorize = (requiredRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorizedError('User not authenticated'));
    }
    
    const hasRole = requiredRoles.some(role => 
      req.user?.roles?.includes(role)
    );
    
    if (!hasRole) {
      return next(
        forbiddenError('You do not have permission to access this resource')
      );
    }
    
    next();
  };
};

// User-specific rate limiter (more restrictive than global)
export const userRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100') / 2, // Default: 50 requests per window (half of global)
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this user, please try again later',
  // Use user ID from request for tracking
  keyGenerator: (req) => {
    return req.user?.id || req.ip; // Fall back to IP if no user
  },
  skip: (req) => !req.user // Skip if no user (will fall back to global rate limit)
});

// Special rate limiter for meta-transaction submitting endpoints
export const metaTxRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: parseInt(process.env.DAILY_USER_SUBSIDY_LIMIT || '10'), // Default: 10 tx per day
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Daily free transaction limit reached',
  keyGenerator: (req) => {
    return req.user?.address || req.ip;
  },
  skip: (req) => !req.user
});