import { type FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";

let authEmulatorConnected = false;

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

function attachAuthEmulator(auth: Auth) {
  if (typeof window === "undefined") {
    return;
  }

  // Check if emulator should be used
  const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

  console.log("Firebase Emulator Config:", {
    useEmulator,
    envValue: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR,
    authEmulatorConnected
  });

  if (!useEmulator) {
    console.log("Firebase emulator disabled - using production auth");
    return;
  }

  if (authEmulatorConnected) {
    return;
  }

  const url = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL ?? "http://127.0.0.1:9099";
  console.log("Connecting to Firebase emulator at:", url);
  connectAuthEmulator(auth, url, { disableWarnings: true });
  authEmulatorConnected = true;
}

export function getFirebaseClientAuth() {
  const app = getFirebaseClientApp();

  if (!app) {
    return null;
  }

  const auth = getAuth(app);
  attachAuthEmulator(auth);
  return auth;
}
