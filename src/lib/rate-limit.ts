/**
 * Rate limiting utilities
 * Uses in-memory store for development, Redis for production
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class MemoryRateLimitStore {
  private store: RateLimitStore = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach(key => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, 5 * 60 * 1000);
  }

  async get(key: string): Promise<{ count: number; resetTime: number } | null> {
    const entry = this.store[key];
    if (!entry) return null;
    
    // Check if expired
    if (entry.resetTime < Date.now()) {
      delete this.store[key];
      return null;
    }
    
    return entry;
  }

  async set(key: string, count: number, resetTime: number): Promise<void> {
    this.store[key] = { count, resetTime };
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const entry = await this.get(key);
    
    if (!entry) {
      const resetTime = now + windowMs;
      await this.set(key, 1, resetTime);
      return { count: 1, resetTime };
    }
    
    const newCount = entry.count + 1;
    await this.set(key, newCount, entry.resetTime);
    return { count: newCount, resetTime: entry.resetTime };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Use memory store for development, Redis for production
const rateLimitStore = new MemoryRateLimitStore();

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Create a rate limiter function
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (
    identifier: string,
    isSuccess: boolean = true
  ): Promise<RateLimitResult> => {
    // Skip if configured
    if (skipSuccessfulRequests && isSuccess) {
      return {
        success: true,
        limit: max,
        remaining: max,
        reset: Date.now() + windowMs,
      };
    }

    if (skipFailedRequests && !isSuccess) {
      return {
        success: true,
        limit: max,
        remaining: max,
        reset: Date.now() + windowMs,
      };
    }

    const result = await rateLimitStore.increment(identifier, windowMs);

    if (result.count > max) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return {
        success: false,
        limit: max,
        remaining: 0,
        reset: result.resetTime,
        retryAfter,
      };
    }

    return {
      success: true,
      limit: max,
      remaining: Math.max(0, max - result.count),
      reset: result.resetTime,
    };
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return ip;
}

/**
 * Common rate limiters
 */
export const rateLimiters = {
  // Strict rate limiter for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts. Please try again later.',
  }),

  // General API rate limiter
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  }),

  // Strict rate limiter for sensitive operations
  strict: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'Too many requests. Please try again later.',
  }),

  // Rate limiter for search endpoints
  search: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
  }),
};

