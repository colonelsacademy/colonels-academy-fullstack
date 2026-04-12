import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { type FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import {
  type User,
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  getReactNativePersistence,
  initializeAuth,
  onIdTokenChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { readPublicMobileEnv } from "@colonels-academy/config";

// Configure WebBrowser for Firebase Auth
WebBrowser.maybeCompleteAuthSession();

function getFirebaseConfig(): FirebaseOptions | null {
  // Try to get from Expo Constants first (for standalone builds)
  const extra = Constants.expoConfig?.extra;
  
  if (extra?.EXPO_PUBLIC_FIREBASE_API_KEY) {
    return {
      apiKey: extra.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: extra.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: extra.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      appId: extra.EXPO_PUBLIC_FIREBASE_APP_ID
    };
  }
  
  // Fallback to process.env (for dev mode)
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

export { 
  GoogleAuthProvider, 
  getRedirectResult, 
  onIdTokenChanged, 
  signInWithCredential, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
};
export type { User };
