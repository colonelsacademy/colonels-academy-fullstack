import { readPublicWebEnv } from "@colonels-academy/config";

// For server-side API routes, use server env var or fallback to public env var
const serverSideUrl = process.env.API_BASE_URL;
const publicUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const configUrl = readPublicWebEnv().NEXT_PUBLIC_API_BASE_URL;

export const API_BASE_URL = serverSideUrl ?? publicUrl ?? configUrl ?? "http://localhost:4000";

// Log the resolved URL in development
if (process.env.NODE_ENV === "development" && typeof window === "undefined") {
  console.log("API_BASE_URL resolved to:", API_BASE_URL, {
    serverSideUrl,
    publicUrl,
    configUrl
  });
}
