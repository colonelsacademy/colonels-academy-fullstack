import { readPublicWebEnv } from "@colonels-academy/config";

// Server-side API base URL resolution
// Priority: API_BASE_URL (server env) > NEXT_PUBLIC_API_BASE_URL (public env) > localhost fallback
export const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  readPublicWebEnv().NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";

// Log the resolved URL in development for debugging
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.debug("[API Client] Resolved API_BASE_URL:", API_BASE_URL);
}
