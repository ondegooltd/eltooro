import { Redis } from "@upstash/redis";

// Initialize Redis connection (only if credentials are provided)
const redis =
  (process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL) &&
  (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || "",
        token:
          process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN || "",
      })
    : null;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  PRODUCTS: 5 * 60, // 5 minutes
  CATEGORIES: 60 * 60, // 1 hour
  USER_DATA: 15 * 60, // 15 minutes
  ADMIN_SETTINGS: 30 * 60, // 30 minutes
  ADMIN_INFO: 60 * 60, // 1 hour
} as const;

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!redis) return null;

    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.PRODUCTS
): Promise<void> {
  try {
    if (!redis) return;

    await redis.set(key, value, { ex: ttl });
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    if (!redis) return;

    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    if (!redis) return;

    // Note: SCAN is not available in REST API, so we'll use a workaround
    // In production, use Redis SCAN command if using a full Redis client
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache pattern delete error:", error);
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  products: {
    list: (category?: string, page?: number) =>
      `products:list:${category || "all"}:${page || 1}`,
    detail: (id: string) => `products:${id}`,
    related: (id: string) => `products:${id}:related`,
    search: (query: string) => `products:search:${query}`,
    trending: (limit?: number) => `products:trending:${limit || 8}`,
    bestSellers: (limit?: number, category?: string) =>
      `products:best-sellers:${category || "all"}:${limit || 8}`,
    newArrivals: (limit?: number) => `products:new-arrivals:${limit || 8}`,
    recommended: (limit?: number) => `products:recommended:${limit || 8}`,
  },
  categories: {
    all: () => "categories:all",
    detail: (slug: string) => `categories:${slug}`,
  },
  users: {
    cart: (userId: string) => `user:${userId}:cart`,
    profile: (userId: string) => `user:${userId}:profile`,
    addresses: (userId: string) => `user:${userId}:addresses`,
  },
  admin: {
    settings: () => "admin:settings",
    info: (slug?: string) => (slug ? `admin:info:${slug}` : "admin:info:all"),
  },
};

/**
 * Invalidate product cache
 */
export async function invalidateProductCache(
  productId?: string
): Promise<void> {
  if (productId) {
    await deleteCache(cacheKeys.products.detail(productId));
    await deleteCache(cacheKeys.products.related(productId));
  }
  await deleteCachePattern("products:list:*");
  await deleteCachePattern("products:search:*");
}

/**
 * Invalidate category cache
 */
export async function invalidateCategoryCache(slug?: string): Promise<void> {
  if (slug) {
    await deleteCache(cacheKeys.categories.detail(slug));
  }
  await deleteCache(cacheKeys.categories.all());
  await deleteCachePattern("products:list:*");
}

/**
 * Invalidate user cache
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await deleteCache(cacheKeys.users.cart(userId));
  await deleteCache(cacheKeys.users.profile(userId));
  await deleteCache(cacheKeys.users.addresses(userId));
}

/**
 * Invalidate admin cache
 */
export async function invalidateAdminCache(): Promise<void> {
  await deleteCache(cacheKeys.admin.settings());
  await deleteCachePattern("admin:info:*");
}
