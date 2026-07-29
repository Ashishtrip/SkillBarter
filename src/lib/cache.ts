// Simple in-memory cache for development
// In production, you would use Redis or similar

interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T = unknown>(key: string, data: T, ttlSeconds = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  get<T = unknown>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get all cache keys (for invalidation)
  getAllKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache key for user-specific data
  getUserKey(userId: string, suffix: string): string {
    return `user:${userId}:${suffix}`;
  }

  // Get cache key for public data
  getPublicKey(suffix: string, params?: Record<string, unknown>): string {
    const paramString = params ? `:${JSON.stringify(params)}` : '';
    return `public:${suffix}${paramString}`;
  }
}

export const cache = new MemoryCache();

// Cache decorator for API routes
export function withCache(ttlSeconds = 300) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    descriptor.value = async function (this: any, ...args: unknown[]) {
      const cacheKey = `${propertyName}:${JSON.stringify(args)}`;

      // Try to get from cache
      const cached = cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Execute method and cache result
  const result = await method.apply(this as any, args as any);
      cache.set(cacheKey, result, ttlSeconds);

      return result;
  } as any;
  };
}

// Cache invalidation helpers
export const cacheInvalidation = {
  // Invalidate user-specific caches
  invalidateUser(userId: string) {
    const keysToDelete: string[] = [];
    for (const key of cache.getAllKeys()) {
      if (key.startsWith(`user:${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  },

  // Invalidate public caches
  invalidatePublic(suffix: string) {
    const keysToDelete: string[] = [];
    for (const key of cache.getAllKeys()) {
      if (key.startsWith(`public:${suffix}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  },

  // Invalidate all caches
  invalidateAll() {
    cache.clear();
  },
};
