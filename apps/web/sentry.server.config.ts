/**
 * Sentry Server Configuration
 * Captures errors in Next.js server-side code
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA || "development",

  // Server-specific settings
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Sentry Error (not sent in dev):",
        hint.originalException || hint.syntheticException
      );
      return null;
    }
    return event;
  }
});
