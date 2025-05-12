import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom API error class
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Used to distinguish operational errors from programming errors
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Create different types of errors
export const notFoundError = (message = 'Resource not found') => {
  return new ApiError(404, message);
};

export const badRequestError = (message = 'Bad request') => {
  return new ApiError(400, message);
};

export const unauthorizedError = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

export const forbiddenError = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

export const serverError = (message = 'Internal server error') => {
  return new ApiError(500, message, false);
};

// Error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Default to 500 server error
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;
  
  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from a validation library)
    statusCode = 400;
    message = err.message;
    isOperational = true;
  } else if (err.name === 'UnauthorizedError') {
    // Handle auth errors (e.g., from JWT middleware)
    statusCode = 401;
    message = 'Invalid or expired token';
    isOperational = true;
  }
  
  // Log error details
  const errorResponse = {
    status: 'error',
    statusCode,
    message
  };
  
  if (process.env.NODE_ENV === 'development') {
    logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`);
    logger.error(err.stack || 'No stack trace available');
    
    // Add stack trace in development
    (errorResponse as any).stack = err.stack;
  } else {
    // In production, only log operational errors as warnings, and programming errors as errors
    if (isOperational) {
      logger.warn(`${req.method} ${req.path} - ${statusCode}: ${message}`);
    } else {
      logger.error(`${req.method} ${req.path} - ${statusCode}: ${message}`);
      logger.error(err.stack || 'No stack trace available');
    }
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper (for async route handlers)
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};