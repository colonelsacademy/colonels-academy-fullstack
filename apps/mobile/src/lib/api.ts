import { createApiClient } from "@colonels-academy/api-client";
import { readPublicMobileEnv } from "@colonels-academy/config";

const env = readPublicMobileEnv();

export const mobileApiClient = createApiClient({
  baseUrl: env.EXPO_PUBLIC_API_BASE_URL
});
