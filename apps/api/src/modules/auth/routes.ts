import type {
  AuthCsrfResponse,
  AuthSessionLoginRequest,
  AuthSessionResponse,
  AuthSessionUser
} from "@colonels-academy/contracts";
import type { FastifyPluginAsync } from "fastify";

import type { AuthUser } from "../../plugins/auth";
import { syncUserWithPostgres } from "./user-sync";

function toSessionUser(authUser: AuthUser): AuthSessionUser {
  return {
    uid: authUser.uid,
    ...(authUser.email ? { email: authUser.email } : {}),
    ...(authUser.role ? { role: authUser.role } : {})
  };
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    "/csrf",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute"
        }
      }
    },
    async (_request, reply) => {
      reply.header("cache-control", "no-store");

      const csrfToken = fastify.issueCsrfToken(reply);
      const response: AuthCsrfResponse = {
        csrfToken,
        cookieName: fastify.authCookies.csrfCookieName,
        headerName: fastify.authCookies.csrfHeaderName
      };

      return response;
    }
  );

  fastify.get(
    "/session",
    {
      config: {
        rateLimit: {
          max: 120,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      reply.header("cache-control", "no-store");

      const authResult = await fastify.authenticateRequest(request);

      // Enrich role from Postgres so admin users see their role correctly
      if (authResult.user) {
        const dbUser = await fastify.prisma.user.findUnique({
          where: { firebaseUid: authResult.user.uid },
          select: { role: true }
        });
        if (dbUser?.role) {
          authResult.user.role = dbUser.role.toLowerCase();
        }
      }

      const response: AuthSessionResponse = {
        authenticated: Boolean(authResult.user),
        user: authResult.user ? toSessionUser(authResult.user) : null,
        authMethod: authResult.method
      };

      return response;
    }
  );

  fastify.post<{ Body: Partial<AuthSessionLoginRequest> }>(
    "/session-login",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      reply.header("cache-control", "no-store");
      fastify.assertCsrfProtection(request);

      const idToken = typeof request.body?.idToken === "string" ? request.body.idToken.trim() : "";

      if (!idToken) {
        throw fastify.httpErrors.badRequest("A Firebase ID token is required.");
      }

      const authUser = await fastify.createSession(reply, idToken);

      // Phase 2: Sync with PostgreSQL
      await syncUserWithPostgres(fastify.prisma, authUser, request.log);

      fastify.log.info(
        {
          uid: authUser.uid,
          authMethod: "session"
        },
        "Issued Firebase session cookie and synced with Postgres."
      );

      const response: AuthSessionResponse = {
        authenticated: true,
        user: toSessionUser(authUser),
        authMethod: "session"
      };

      return response;
    }
  );

  fastify.post(
    "/session-logout",
    {
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      reply.header("cache-control", "no-store");
      fastify.assertCsrfProtection(request);

      const sessionCookie = request.cookies[fastify.authCookies.sessionCookieName];
      const authUser = await fastify.verifySessionCookie(sessionCookie);

      if (authUser) {
        await fastify.revokeUserSessions(authUser.uid);
        fastify.log.info(
          {
            uid: authUser.uid,
            authMethod: "session"
          },
          "Revoked Firebase session cookie."
        );
      }

      fastify.clearSession(reply);

      const response: AuthSessionResponse = {
        authenticated: false,
        user: null,
        authMethod: "none"
      };

      return response;
    }
  );

  // ── POST /v1/auth/mobile-sync ──────────────────────────────────────────────
  // Mobile-only endpoint: accepts Bearer token, syncs user to Postgres.
  // No CSRF required since mobile apps can't use cookie-based CSRF.
  fastify.post(
    "/mobile-sync",
    {
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 minute"
        }
      }
    },
    async (request, reply) => {
      reply.header("cache-control", "no-store");

      const authUser = await fastify.requireAuth(request);
      await syncUserWithPostgres(fastify.prisma, authUser, request.log);

      return { ok: true, uid: authUser.uid };
    }
  );
};

export default authRoutes;
