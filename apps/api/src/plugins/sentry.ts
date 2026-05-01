/**
 * Sentry Plugin for Fastify API
 * Captures errors and performance data
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    fastify.log.warn("SENTRY_DSN not configured - error monitoring disabled");
    return;
  }

  // Initialize Sentry
  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
    integrations: [nodeProfilingIntegration()],
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === "development") {
        fastify.log.error(
          { err: hint.originalException || hint.syntheticException },
          "Sentry Error (not sent in dev)"
        );
        return null;
      }
      return event;
    }
  });

  // Add error handler hook
  fastify.addHook("onError", async (request, _reply, error) => {
    Sentry.withScope((scope) => {
      // Add request context
      scope.setContext("request", {
        method: request.method,
        url: request.url,
        headers: {
          "user-agent": request.headers["user-agent"],
          referer: request.headers.referer
        },
        query: request.query,
        params: request.params
      });

      // Add user context if authenticated
      if (request.authUser) {
        const userContext: { id: string; email?: string } = {
          id: request.authUser.uid
        };
        if (request.authUser.email) {
          userContext.email = request.authUser.email;
        }
        scope.setUser(userContext);
      }

      // Capture exception
      Sentry.captureException(error);
    });
  });

  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    await Sentry.close(2000);
  });

  fastify.log.info("Sentry error monitoring enabled");
});
