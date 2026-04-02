import { readPublicWebEnv } from "@colonels-academy/config";

export const API_BASE_URL =
  process.env.API_BASE_URL ??
  readPublicWebEnv().NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:4000";
