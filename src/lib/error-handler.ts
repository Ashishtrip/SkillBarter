/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export class CustomError extends Error {
  code?: string;
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create standardized error responses
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = 'An error occurred'
): { error: string; code?: string; details?: any } {
  if (error instanceof CustomError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      error: error.message || defaultMessage,
    };
  }

  if (typeof error === 'string') {
    return {
      error,
    };
  }

  return {
    error: defaultMessage,
  };
}

/**
 * Log error with context
 */
export function logError(error: unknown, context?: Record<string, any>) {
  const errorInfo: any = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
  };

  if (context) {
    errorInfo.context = context;
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Import monitoring utilities
    try {
      const { captureException } = require('./monitoring');
      if (error instanceof Error) {
        captureException(error, {
          action: context?.action,
          userId: context?.userId,
          metadata: context,
        });
      }
    } catch (e) {
      // Monitoring not available, just log
      console.error('Error logged (monitoring unavailable):', errorInfo);
    }
  }

  return errorInfo;
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

/**
 * Common error factory functions
 */
export const createValidationError = (message: string, details?: any) =>
  new CustomError(message, 400, ErrorCodes.VALIDATION_ERROR, details);

export const createAuthenticationError = (message: string = 'Authentication required') =>
  new CustomError(message, 401, ErrorCodes.AUTHENTICATION_ERROR);

export const createAuthorizationError = (message: string = 'Insufficient permissions') =>
  new CustomError(message, 403, ErrorCodes.AUTHORIZATION_ERROR);

export const createNotFoundError = (resource: string = 'Resource') =>
  new CustomError(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);

export const createConflictError = (message: string) =>
  new CustomError(message, 409, ErrorCodes.CONFLICT);

export const createRateLimitError = (message: string = 'Rate limit exceeded') =>
  new CustomError(message, 429, ErrorCodes.RATE_LIMIT_EXCEEDED);

export const createDatabaseError = (message: string = 'Database operation failed') =>
  new CustomError(message, 500, ErrorCodes.DATABASE_ERROR);

