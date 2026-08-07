import { redis } from './redis';

/**
 * Generic cache-aside pattern for Redis.
 * Tries to read from cache first; on miss, calls the fetcher,
 * stores the result in Redis with the given TTL, and returns it.
 */
export async function cachedQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 120
): Promise<T> {
  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    // Redis down — fall through to fetcher
    console.warn(`[Cache] Redis read failed for key "${key}":`, err);
  }

  // Cache miss — fetch from source
  const data = await fetcher();

  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`[Cache] Redis write failed for key "${key}":`, err);
  }

  return data;
}

/**
 * Invalidate a single cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (err) {
    console.warn(`[Cache] Failed to invalidate key "${key}":`, err);
  }
}

/**
 * Invalidate all cache keys matching a prefix using SCAN.
 * Upstash Redis supports the `scan` command.
 */
export async function invalidateByPrefix(prefix: string): Promise<void> {
  try {
    let cursor: string | number = 0;
    do {
      const result: [string | number, string[]] = await redis.scan(cursor, {
        match: `${prefix}*`,
        count: 100,
      });
      cursor = result[0];
      const keys: string[] = result[1];
      if (keys.length > 0) {
        const pipeline = redis.pipeline();
        keys.forEach((key: string) => pipeline.del(key));
        await pipeline.exec();
      }
    } while (cursor !== 0 && cursor !== '0');
  } catch (err) {
    console.warn(`[Cache] Failed to invalidate prefix "${prefix}":`, err);
  }
}

// ── Cache key constants ──
export const CACHE_KEYS = {
  ALL_PRODUCTS: 'products:all',
  ACTIVE_DISCOUNTS: 'discounts:active',
  ALL_RATINGS: 'ratings:all',
  PRODUCT_RATINGS: (productId: string) => `ratings:product:${productId}`,
  USER_PROFILES: 'user_profiles_map',
  ORDERS_FOR_BESTSELLERS: 'orders:bestsellers',
} as const;

// ── TTL values (seconds) ──
export const CACHE_TTL = {
  PRODUCTS: 120,       // 2 minutes
  DISCOUNTS: 60,       // 1 minute
  RATINGS: 120,        // 2 minutes
  USER_PROFILES: 300,  // 5 minutes
  ORDERS: 180,         // 3 minutes
} as const;
