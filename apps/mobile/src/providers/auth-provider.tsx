import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type User,
  getFirebaseMobileAuth,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
} from "../lib/firebase";

import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { mobileApiClient } from "../lib/api";
import { readPublicMobileEnv } from "@colonels-academy/config";

const env = readPublicMobileEnv();

interface AuthContextValue {
  accessToken: string | null;
  error: string | null;
  isConfigured: boolean;
  isReady: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Configure Google Sign-In once at module level
const webClientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
if (webClientId) {
  GoogleSignin.configure({ webClientId, offlineAccess: false });
  // Clear any stale Google session on startup to prevent DEVELOPER_ERROR on load
  GoogleSignin.signOut().catch(() => {});
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const auth = getFirebaseMobileAuth();

  // Firebase auth state listener — also syncs user to Postgres on login
  useEffect(() => {
    if (!auth) {
      setIsReady(true);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const idToken = await nextUser.getIdToken();
        setAccessToken(idToken);
        // Sync user to Postgres via API (creates user record if not exists)
        try {
          const csrfRes = await mobileApiClient.getCsrfToken();
          await mobileApiClient.loginWithIdToken(idToken, csrfRes.csrfToken);
        } catch (err) {
          // Non-fatal — user is still authenticated via Firebase
          console.warn("Failed to sync user to Postgres:", err);
        }      } else {
        setAccessToken(null);
      }
      setIsReady(true);
    });

    return unsubscribe;
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      error,
      isConfigured: Boolean(auth),
      isReady,
      user,

      async signInWithEmail(email, password) {
        if (!auth) {
          setError("Firebase not configured");
          return;
        }

        try {
          setError(null);
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err: any) {
          setError(err.message);
        }
      },

      async signUpWithEmail(email, password) {
        if (!auth) {
          setError("Firebase not configured");
          return;
        }

        try {
          setError(null);
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } catch (err: any) {
          setError(err.message);
        }
      },

      async signInWithGoogle() {
        if (!auth) {
          setError("Firebase not configured");
          return;
        }
        try {
          setError(null);
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          await GoogleSignin.signOut();
          const signInResult = await GoogleSignin.signIn();
          const idToken = signInResult.data?.idToken;
          if (!idToken) throw new Error("No ID token from Google");
          const credential = GoogleAuthProvider.credential(idToken);
          await signInWithCredential(auth, credential);
        } catch (err: any) {
          if (err.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled — no error shown
          } else if (err.code === statusCodes.IN_PROGRESS) {
            setError("Sign-in already in progress");
          } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            setError("Google Play Services not available");
          } else if (err.message?.includes("DEVELOPER_ERROR")) {
            setError("Google Sign-In is not configured correctly. Please use email/password.");
          } else {
            setError(err.message ?? "Google Sign-In failed");
          }
        }
      },

      async signOutUser() {
        if (!auth) return;
        try {
          setError(null);
          await signOut(auth);
          // Also sign out from Google if they used Google Sign-In
          try { await GoogleSignin.signOut(); } catch { /* not signed in via Google */ }
        } catch (err: any) {
          setError(err.message);
        }
      },
    }),
    [accessToken, auth, error, isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
