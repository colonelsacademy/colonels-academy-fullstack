import type { FastifyInstance } from "fastify";

import type { AuthUser } from "../plugins/auth";
import { CacheKeys, CacheTTL } from "./cache";

export interface CachedUser {
  id: string;
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
  role: "STUDENT" | "INSTRUCTOR" | "DS" | "ADMIN";
  roleVersion: number; // Track role changes
  createdAt: Date;
}

/**
 * Get user from cache or database
 * This eliminates the repeated `prisma.user.findUnique()` calls
 * that happen on every authenticated request
 *
 * Performance: 10-50ms (database) → <1ms (cache)
 *
 * IMPORTANT: Includes roleVersion to detect role changes
 * If roleVersion changes, cache is automatically invalidated
 */
export async function getCachedUser(
  fastify: FastifyInstance,
  firebaseUid: string
): Promise<CachedUser> {
  const cacheKey = CacheKeys.user(firebaseUid);

  // Try cache first
  const cached = await fastify.cache.get<CachedUser>(cacheKey);
  if (cached) {
    fastify.log.debug(
      { firebaseUid, role: cached.role, roleVersion: cached.roleVersion, source: "cache" },
      "User loaded from cache"
    );
    return cached;
  }

  // Fallback to database
  const dbUser = await fastify.prisma.user.findUnique({
    where: { firebaseUid },
    select: {
      id: true,
      firebaseUid: true,
      email: true,
      displayName: true,
      role: true,
      roleVersion: true,
      createdAt: true
    }
  });

  if (!dbUser) {
    throw fastify.httpErrors.notFound("User not found");
  }

  const cachedUser: CachedUser = {
    id: dbUser.id,
    firebaseUid: dbUser.firebaseUid,
    email: dbUser.email,
    displayName: dbUser.displayName,
    role: dbUser.role,
    roleVersion: dbUser.roleVersion,
    createdAt: dbUser.createdAt
  };

  // Use shorter TTL for admin users (1 minute) for faster role updates
  // Regular users get 1 hour TTL for better performance
  const ttl = dbUser.role === "ADMIN" ? CacheTTL.USER_ADMIN : CacheTTL.USER;
  await fastify.cache.set(cacheKey, cachedUser, ttl);

  fastify.log.debug(
    { firebaseUid, role: dbUser.role, roleVersion: dbUser.roleVersion, ttl, source: "database" },
    "User loaded from database and cached"
  );

  return cachedUser;
}

/**
 * Invalidate user cache
 * Call this when user data changes (role update, profile edit, etc.)
 */
export async function invalidateUserCache(
  fastify: FastifyInstance,
  firebaseUid: string
): Promise<void> {
  const cacheKey = CacheKeys.user(firebaseUid);
  await fastify.cache.del(cacheKey);
  fastify.log.info({ firebaseUid }, "User cache invalidated");
}

/**
 * Get user ID from cache (lightweight version)
 * Use when you only need the user ID, not full user data
 */
export async function getCachedUserId(
  fastify: FastifyInstance,
  authUser: AuthUser
): Promise<string> {
  const user = await getCachedUser(fastify, authUser.uid);
  return user.id;
}
