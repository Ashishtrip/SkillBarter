import * as Sentry from '@sentry/nextjs';

/**
 * Monitoring and error tracking utilities
 * Supports Sentry integration for production
 */

export interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Initialize error tracking (Sentry)
 */
export function initErrorTracking() {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,
    });
    console.log('Error tracking initialized (Sentry DSN configured)');
  } else {
    console.log('Error tracking disabled (development mode or no DSN)');
  }
}

/**
 * Capture exception
 */
export function captureException(error: Error, context?: ErrorContext) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      user: context?.userId ? { id: context.userId } : undefined,
      tags: {
        action: context?.action,
      },
      extra: context?.metadata,
    });
    console.error('Exception captured:', error, context);
  } else {
    console.error('Exception (dev):', error, context);
  }
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: level as Sentry.SeverityLevel,
      user: context?.userId ? { id: context.userId } : undefined,
      tags: {
        action: context?.action,
      },
      extra: context?.metadata,
    });
    console.log(`Message captured [${level}]:`, message, context);
  } else {
    console.log(`Message [${level}]:`, message, context);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, userData?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      ...userData,
    });
    console.log('User context set:', userId, userData);
  }
}

/**
 * Performance monitoring
 */
export function trackPerformance(metricName: string, duration: number, metadata?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'production') {
    // Track performance metrics
    Sentry.metrics.distribution(metricName, duration, {
      tags: metadata,
    } as any);
    console.log(`Performance: ${metricName} took ${duration}ms`, metadata);
  }
}

