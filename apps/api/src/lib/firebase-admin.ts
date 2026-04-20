import { cert, getApps, initializeApp } from "firebase-admin/app";
import { type Auth, getAuth } from "firebase-admin/auth";

import type { ApiEnv } from "@colonels-academy/config";

const APP_NAME = "colonels-academy-api";

export function getFirebaseAdminAuth(env: ApiEnv): Auth | null {
  if (env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = env.FIREBASE_AUTH_EMULATOR_HOST;
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const existingApp = getApps().find((app) => app.name === APP_NAME);

  const app =
    existingApp ??
    initializeApp(
      {
        credential: cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY
        }),
        projectId: env.FIREBASE_PROJECT_ID
      },
      APP_NAME
    );

  return getAuth(app);
}
