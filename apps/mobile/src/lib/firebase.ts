import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from "firebase/auth";

import { readPublicMobileEnv } from "@colonels-academy/config";

function getFirebaseConfig(): FirebaseOptions | null {
  const env = readPublicMobileEnv();

  if (
    !env.EXPO_PUBLIC_FIREBASE_API_KEY ||
    !env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ||
    !env.EXPO_PUBLIC_FIREBASE_APP_ID
  ) {
    return null;
  }

  return {
    apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: env.EXPO_PUBLIC_FIREBASE_APP_ID
  };
}

export function getFirebaseMobileApp() {
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig) {
    return null;
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseMobileAuth() {
  const app = getFirebaseMobileApp();

  if (!app) {
    return null;
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    return getAuth(app);
  }
}

export { onIdTokenChanged, signInWithEmailAndPassword, signOut };
export type { User };
