import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";

function getFirebaseConfig(): FirebaseOptions | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !authDomain || !projectId || !appId) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    appId
  };
}

export function getFirebaseClientApp() {
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseClientAuth() {
  const app = getFirebaseClientApp();

  return app ? getAuth(app) : null;
}
