import type { FastifyBaseLogger } from "fastify";
import type Redis from "ioredis";

/**
 * CacheManager - Centralized Redis caching with fallback support
 *
 * Features:
 * - Automatic JSON serialization/deserialization
 * - Graceful fallback when Redis unavailable
 * - Pattern-based cache invalidation
 * - Cache hit/miss logging
 */
export class CacheManager {
  constructor(
    private redis: Redis | null,
    private log: FastifyBaseLogger
  ) {}

  /**
   * Get value from cache
   * Returns null if not found or Redis unavailable
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const cached = await this.redis.get(key);
      if (!cached) {
        this.log.debug({ key, hit: false }, "Cache miss");
        return null;
      }

      this.log.debug({ key, hit: true }, "Cache hit");
      return JSON.parse(cached) as T;
    } catch (error) {
      this.log.warn({ err: error, key }, "Cache get failed");
      return null;
    }
  }

  /**
   * Set value in cache with TTL (seconds)
   */
  async set(key: string, value: unknown, ttl: number): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      this.log.debug({ key, ttl }, "Cache set");
    } catch (error) {
      this.log.warn({ err: error, key }, "Cache set failed");
    }
  }

  /**
   * Delete one or more keys from cache
   */
  async del(...keys: string[]): Promise<void> {
    if (!this.redis || keys.length === 0) {
      return;
    }

    try {
      await this.redis.del(...keys);
      this.log.debug({ keys, count: keys.length }, "Cache deleted");
    } catch (error) {
      this.log.warn({ err: error, keys }, "Cache delete failed");
    }
  }

  /**
   * Invalidate all keys matching a pattern
   * Example: invalidatePattern("user:*") deletes all user caches
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.log.info({ pattern, count: keys.length }, "Cache pattern invalidated");
      }
    } catch (error) {
      this.log.warn({ err: error, pattern }, "Cache pattern invalidation failed");
    }
  }

  /**
   * Check if Redis is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }

  /**
   * Get cache statistics (if Redis available)
   */
  async getStats(): Promise<{ keys: number; memory: string } | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const dbsize = await this.redis.dbsize();
      const info = await this.redis.info("memory");
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      const memory = memoryMatch?.[1] ?? "unknown";

      return { keys: dbsize, memory };
    } catch (error) {
      this.log.warn({ err: error }, "Failed to get cache stats");
      return null;
    }
  }
}

/**
 * Cache key builders for consistent naming
 */
export const CacheKeys = {
  user: (firebaseUid: string) => `user:${firebaseUid}`,
  userById: (userId: string) => `user:id:${userId}`,
  session: (sessionCookie: string) => `session:${sessionCookie}`,
  courseList: () => "courses:list",
  course: (slug: string) => `course:${slug}`,
  instructorList: () => "instructors:list",
  enrollment: (userId: string, courseId: string) => `enrollment:${userId}:${courseId}`,
  progress: (userId: string, courseId: string) => `progress:${userId}:${courseId}`,
  courseLessons: (courseSlug: string, userId?: string) =>
    userId ? `lessons:${courseSlug}:${userId}` : `lessons:${courseSlug}:public`
} as const;

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  USER: 3600, // 1 hour
  SESSION: 432000, // 5 days (match session cookie)
  COURSE_LIST: 300, // 5 minutes
  COURSE: 300, // 5 minutes
  INSTRUCTOR_LIST: 600, // 10 minutes
  ENROLLMENT: 600, // 10 minutes
  PROGRESS: 300, // 5 minutes
  LESSONS: 300 // 5 minutes
} as const;
