import { randomBytes, timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { DecodedIdToken } from "firebase-admin/auth";

import { loadApiEnv } from "@colonels-academy/config";

import { getFirebaseAdminAuth } from "../lib/firebase-admin";

const CSRF_HEADER_NAME = "x-csrf-token" as const;

export interface AuthUser {
  uid: string;
  email?: string;
  role?: string;
  claims: DecodedIdToken;
}

export interface AuthResult {
  user: AuthUser | null;
  method: "session" | "bearer" | "none";
}

export interface AuthCookieSettings {
  sessionCookieName: string;
  csrfCookieName: string;
  csrfHeaderName: typeof CSRF_HEADER_NAME;
  sessionMaxAgeMs: number;
  csrfMaxAgeSeconds: number;
  secure: boolean;
  domain?: string;
  sameSite: "none" | "lax" | "strict";
}

declare module "fastify" {
  interface FastifyRequest {
    authUser?: AuthUser;
    authMethod?: AuthResult["method"];
  }

  interface FastifyInstance {
    authCookies: AuthCookieSettings;
    verifyFirebaseToken: (authorization?: string) => Promise<AuthUser | null>;
    verifySessionCookie: (sessionCookie?: string) => Promise<AuthUser | null>;
    authenticateRequest: (request: FastifyRequest) => Promise<AuthResult>;
    requireAuth: (request: FastifyRequest) => Promise<AuthUser>;
    requireRole: (request: FastifyRequest, allowedRoles: string[]) => Promise<AuthUser>;
    issueCsrfToken: (reply: FastifyReply) => string;
    assertCsrfProtection: (request: FastifyRequest) => void;
    createSession: (reply: FastifyReply, idToken: string) => Promise<AuthUser>;
    clearSession: (reply: FastifyReply) => void;
    revokeUserSessions: (uid: string) => Promise<void>;
  }
}

function mapAuthUser(decoded: DecodedIdToken): AuthUser {
  const extendedDecoded = decoded as DecodedIdToken & {
    roles?: unknown;
  };
  const authUser: AuthUser = {
    uid: decoded.uid,
    claims: decoded
  };

  if (decoded.email) {
    authUser.email = decoded.email;
  }

  const roleClaim =
    typeof decoded.role === "string"
      ? decoded.role
      : Array.isArray(extendedDecoded.roles) && typeof extendedDecoded.roles[0] === "string"
        ? extendedDecoded.roles[0]
        : undefined;

  if (roleClaim) {
    authUser.role = roleClaim.trim().toLowerCase();
  }

  return authUser;
}

function readHeaderToken(headerValue: string | string[] | undefined) {
  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  return headerValue;
}

function matchesCsrfToken(cookieToken?: string, headerValue?: string | string[]) {
  const headerToken = readHeaderToken(headerValue);

  if (!cookieToken || !headerToken) {
    return false;
  }

  const cookieBuffer = Buffer.from(cookieToken);
  const headerBuffer = Buffer.from(headerToken);

  if (cookieBuffer.length !== headerBuffer.length) {
    return false;
  }

  return timingSafeEqual(cookieBuffer, headerBuffer);
}

function clearAuthContext(request: FastifyRequest) {
  // biome-ignore lint/performance/noDelete: exactOptionalPropertyTypes requires delete, not undefined assignment
  delete request.authUser;
  // biome-ignore lint/performance/noDelete: exactOptionalPropertyTypes requires delete, not undefined assignment
  delete request.authMethod;
}

function attachAuthContext(request: FastifyRequest, authResult: AuthResult) {
  if (!authResult.user) {
    clearAuthContext(request);
    request.authMethod = "none";
    return;
  }

  request.authUser = authResult.user;
  request.authMethod = authResult.method;
}

export default fp(async (fastify) => {
  const env = loadApiEnv();
  const adminAuth = getFirebaseAdminAuth(env);
  const authCookies: AuthCookieSettings = {
    sessionCookieName: env.SESSION_COOKIE_NAME,
    csrfCookieName: env.CSRF_COOKIE_NAME,
    csrfHeaderName: CSRF_HEADER_NAME,
    sessionMaxAgeMs: env.SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1_000,
    csrfMaxAgeSeconds: env.CSRF_TOKEN_MAX_AGE_MINUTES * 60,
    secure: env.SESSION_COOKIE_SECURE === true || env.SESSION_COOKIE_SECURE === "true",
    sameSite: "none",
    ...(env.SESSION_COOKIE_DOMAIN ? { domain: env.SESSION_COOKIE_DOMAIN } : {})
  };

  async function verifyFirebaseToken(authorization?: string): Promise<AuthUser | null> {
    if (!adminAuth || !authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      return null;
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      return mapAuthUser(decoded);
    } catch {
      return null;
    }
  }

  async function verifySessionCookie(sessionCookie?: string): Promise<AuthUser | null> {
    if (!adminAuth || !sessionCookie) {
      return null;
    }

    try {
      const decoded = await adminAuth.verifySessionCookie(
        sessionCookie,
        env.FIREBASE_CHECK_REVOKED_SESSIONS
      );
      return mapAuthUser(decoded);
    } catch {
      return null;
    }
  }

  async function authenticateRequest(request: FastifyRequest): Promise<AuthResult> {
    const sessionCookie = request.cookies[authCookies.sessionCookieName];
    const sessionUser = await verifySessionCookie(sessionCookie);

    if (sessionUser) {
      const authResult: AuthResult = {
        user: sessionUser,
        method: "session"
      };

      attachAuthContext(request, authResult);

      return authResult;
    }

    const bearerUser = await verifyFirebaseToken(request.headers.authorization);

    if (bearerUser) {
      const authResult: AuthResult = {
        user: bearerUser,
        method: "bearer"
      };

      attachAuthContext(request, authResult);

      return authResult;
    }

    const authResult: AuthResult = {
      user: null,
      method: "none"
    };

    attachAuthContext(request, authResult);

    return authResult;
  }

  function issueCsrfToken(reply: FastifyReply) {
    const csrfToken = randomBytes(32).toString("hex");

    reply.setCookie(authCookies.csrfCookieName, csrfToken, {
      httpOnly: false,
      sameSite: authCookies.sameSite,
      secure: authCookies.secure,
      path: "/",
      maxAge: authCookies.csrfMaxAgeSeconds,
      ...(authCookies.domain ? { domain: authCookies.domain } : {})
    });

    return csrfToken;
  }

  fastify.decorate("authCookies", authCookies);
  fastify.decorate("verifyFirebaseToken", verifyFirebaseToken);
  fastify.decorate("verifySessionCookie", verifySessionCookie);
  fastify.decorate("authenticateRequest", authenticateRequest);
  fastify.decorate("requireAuth", async (request) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.user) {
      throw fastify.httpErrors.unauthorized("Firebase session cookie or ID token required.");
    }

    return authResult.user;
  });
  fastify.decorate("requireRole", async (request, allowedRoles) => {
    const authUser = await fastify.requireAuth(request);
    const role = authUser.role?.toLowerCase();
    const allowedRoleSet = new Set(allowedRoles.map((allowedRole) => allowedRole.toLowerCase()));

    if (!role || !allowedRoleSet.has(role)) {
      throw fastify.httpErrors.forbidden("Insufficient privileges for this route.");
    }

    return authUser;
  });
  fastify.decorate("issueCsrfToken", issueCsrfToken);
  fastify.decorate("assertCsrfProtection", (request) => {
    const csrfCookie = request.cookies[authCookies.csrfCookieName];
    const csrfHeader = request.headers[authCookies.csrfHeaderName];

    if (!matchesCsrfToken(csrfCookie, csrfHeader)) {
      throw fastify.httpErrors.forbidden("Valid CSRF cookie and header are required.");
    }
  });
  fastify.decorate("createSession", async (reply, idToken) => {
    if (!adminAuth) {
      throw fastify.httpErrors.serviceUnavailable(
        "Firebase Auth admin credentials are not configured."
      );
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const authTime = typeof decoded.auth_time === "number" ? decoded.auth_time * 1_000 : 0;
    const maxAuthAge = env.SESSION_RECENT_SIGN_IN_MINUTES * 60 * 1_000;

    if (!authTime || Date.now() - authTime > maxAuthAge) {
      throw fastify.httpErrors.unauthorized(
        `Recent sign-in required. Reauthenticate within the last ${env.SESSION_RECENT_SIGN_IN_MINUTES} minute(s).`
      );
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: authCookies.sessionMaxAgeMs
    });

    reply.setCookie(authCookies.sessionCookieName, sessionCookie, {
      httpOnly: true,
      sameSite: authCookies.sameSite,
      secure: authCookies.secure,
      path: "/",
      maxAge: Math.floor(authCookies.sessionMaxAgeMs / 1_000),
      ...(authCookies.domain ? { domain: authCookies.domain } : {})
    });

    return mapAuthUser(decoded);
  });
  fastify.decorate("clearSession", (reply) => {
    reply.clearCookie(authCookies.sessionCookieName, {
      path: "/",
      sameSite: authCookies.sameSite,
      secure: authCookies.secure,
      ...(authCookies.domain ? { domain: authCookies.domain } : {})
    });
  });
  fastify.decorate("revokeUserSessions", async (uid) => {
    if (!adminAuth) {
      return;
    }

    await adminAuth.revokeRefreshTokens(uid);
  });
});
