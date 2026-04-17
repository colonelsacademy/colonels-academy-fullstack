import { createApiClient } from "@colonels-academy/api-client";
import { readPublicMobileEnv } from "@colonels-academy/config";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};
const env = readPublicMobileEnv();

export const mobileApiClient = createApiClient({
  baseUrl: extra.EXPO_PUBLIC_API_BASE_URL || env.EXPO_PUBLIC_API_BASE_URL
});
